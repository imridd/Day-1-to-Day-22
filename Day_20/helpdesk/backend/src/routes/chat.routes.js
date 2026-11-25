
import { query, pool, withTx } from '../config/db.js';
import { chatMessageSchema } from '../schemas/index.js';
import { httpError, idParam } from '../utils/errors.js';
import { resolveChatAccess, ROOMS } from '../utils/chatAccess.js';

const unreadSql = (room) =>
  `(SELECT COUNT(*) FROM chats m WHERE m.ticket_id = t.ticket_id AND m.room = '${room}' AND m.sender_id <> ? AND m.read_status = 0)`;

export default async function chatRoutes(app) {
  const auth = [app.authenticate];

  // GET ALL CHAT THREADS
  app.get('/threads', { preHandler: auth }, async (req) => {
    const u = req.currentUser;
    const threads = [];

    if (u.role === 'CUSTOMER') {
      const rows = await query(
        `SELECT t.ticket_id, t.subject, t.status,
                a.name AS agent_name,
                ${unreadSql('CUSTOMER_AGENT')} AS unread
         FROM tickets t
         JOIN users a ON a.id = t.assigned_agent_id
         WHERE t.customer_id = ?
         ORDER BY t.ticket_id DESC`,
        [u.id, u.id]
      );

      rows.forEach((r) =>
        threads.push({
          ticketId: r.ticket_id,
          subject: r.subject,
          status: r.status,
          room: 'CUSTOMER_AGENT',
          counterpart: r.agent_name,
          unread: Number(r.unread)
        })
      );

    } else if (u.role === 'AGENT') {
      const rows = await query(
        `SELECT t.ticket_id, t.subject, t.status,
                c.name AS customer_name,
                ${unreadSql('CUSTOMER_AGENT')} AS unread_customer,
                ${unreadSql('MANAGER_AGENT')} AS unread_manager
         FROM tickets t
         JOIN users c ON c.id = t.customer_id
         WHERE t.assigned_agent_id = ?
         ORDER BY t.ticket_id DESC`,
        [u.id, u.id, u.id]
      );

      rows.forEach((r) => {
        threads.push({
          ticketId: r.ticket_id,
          subject: r.subject,
          status: r.status,
          room: 'CUSTOMER_AGENT',
          counterpart: r.customer_name,
          unread: Number(r.unread_customer)
        });

        threads.push({
          ticketId: r.ticket_id,
          subject: r.subject,
          status: r.status,
          room: 'MANAGER_AGENT',
          counterpart: 'Manager',
          unread: Number(r.unread_manager)
        });
      });

    } else {
      const rows = await query(
        `SELECT t.ticket_id, t.subject, t.status,
                a.name AS agent_name,
                ${unreadSql('MANAGER_AGENT')} AS unread
         FROM tickets t
         JOIN users a ON a.id = t.assigned_agent_id
         ORDER BY t.ticket_id DESC
         LIMIT 300`,
        [u.id]
      );

      rows.forEach((r) =>
        threads.push({
          ticketId: r.ticket_id,
          subject: r.subject,
          status: r.status,
          room: 'MANAGER_AGENT',
          counterpart: r.agent_name,
          unread: Number(r.unread)
        })
      );
    }

    return threads;
  });


  // GET CHAT MESSAGES
  // Old messages remain visible even when the ticket is CLOSED.
  app.get('/:ticketId/:room/messages', { preHandler: auth }, async (req) => {
    const ticketId = idParam(req.params.ticketId);
    const { room } = req.params;

    if (!ROOMS.includes(room)) {
      throw httpError(400, 'Invalid room');
    }

    const access = await resolveChatAccess(
      req.currentUser,
      ticketId,
      room
    );

    if (!access) {
      throw httpError(403, 'You do not have access to this conversation');
    }

    const afterId = Number(req.query.afterId || 0);

    if (!Number.isSafeInteger(afterId) || afterId < 0) {
      throw httpError(400, 'Invalid message cursor');
    }

    const rows = afterId > 0
      ? await query(
          `SELECT m.id, m.ticket_id, m.room, m.sender_id,
                  u.name AS sender_name, m.message,
                  m.read_status, m.created_at
           FROM chats m
           JOIN users u ON u.id = m.sender_id
           WHERE m.ticket_id = ?
             AND m.room = ?
             AND m.id > ?
           ORDER BY m.id ASC
           LIMIT 200`,
          [ticketId, room, afterId]
        )
      : await query(
          `SELECT m.id, m.ticket_id, m.room, m.sender_id,
                  u.name AS sender_name, m.message,
                  m.read_status, m.created_at
           FROM chats m
           JOIN users u ON u.id = m.sender_id
           WHERE m.ticket_id = ?
             AND m.room = ?
           ORDER BY m.id DESC
           LIMIT 200`,
          [ticketId, room]
        );

    return afterId > 0 ? rows : rows.reverse();
  });


  // SEND CHAT MESSAGE
  app.post('/:ticketId/:room/messages', { preHandler: auth }, async (req, reply) => {
    const ticketId = idParam(req.params.ticketId);
    const { room } = req.params;

    if (!ROOMS.includes(room)) {
      throw httpError(400, 'Invalid room');
    }

    const parsed = chatMessageSchema.parse({
      ticketId,
      room,
      message: req.body?.message
    });

    // Lock the ticket row while checking its status and inserting.
    // Ticket closure must wait until this transaction finishes.
    const messageId = await withTx(async (conn) => {
      const [ticketRows] = await conn.execute(
        `SELECT ticket_id, status, customer_id,
                assigned_agent_id, created_by_manager
         FROM tickets
         WHERE ticket_id = ?
         FOR UPDATE`,
        [ticketId]
      );

      const ticket = ticketRows[0];

      if (!ticket || !ticket.assigned_agent_id) {
        throw httpError(403, 'You do not have access to this conversation');
      }

      const user = req.currentUser;
      let receiverId = null;

      if (room === 'CUSTOMER_AGENT') {
        if (
          user.role === 'CUSTOMER' &&
          ticket.customer_id === user.id
        ) {
          receiverId = ticket.assigned_agent_id;

        } else if (
          user.role === 'AGENT' &&
          ticket.assigned_agent_id === user.id
        ) {
          receiverId = ticket.customer_id;
        }

      } else if (room === 'MANAGER_AGENT') {
        if (user.role === 'MANAGER') {
          receiverId = ticket.assigned_agent_id;

        } else if (
          user.role === 'AGENT' &&
          ticket.assigned_agent_id === user.id
        ) {
          receiverId = ticket.created_by_manager;
        }
      }

      if (!receiverId) {
        throw httpError(403, 'You do not have access to this conversation');
      }

      // IMPORTANT: No messages allowed after ticket closure.
      if (ticket.status === 'CLOSED') {
        throw httpError(
          409,
          'This ticket is closed. Chat is read-only.'
        );
      }

      const [result] = await conn.execute(
        `INSERT INTO chats
          (ticket_id, room, sender_id, receiver_id, message)
         VALUES (?, ?, ?, ?, ?)`,
        [
          ticketId,
          room,
          user.id,
          receiverId,
          parsed.message
        ]
      );

      return result.insertId;
    });

    const rows = await query(
      `SELECT m.id, m.ticket_id, m.room, m.sender_id,
              u.name AS sender_name, m.message,
              m.read_status, m.created_at
       FROM chats m
       JOIN users u ON u.id = m.sender_id
       WHERE m.id = ?`,
      [messageId]
    );

    return reply.code(201).send(rows[0]);
  });


  // MARK CHAT MESSAGES AS READ
  app.patch('/:ticketId/:room/read', { preHandler: auth }, async (req) => {
    const ticketId = idParam(req.params.ticketId);
    const { room } = req.params;

    if (!ROOMS.includes(room)) {
      throw httpError(400, 'Invalid room');
    }

    const access = await resolveChatAccess(
      req.currentUser,
      ticketId,
      room
    );

    if (!access) {
      throw httpError(403, 'You do not have access to this conversation');
    }

    await pool.execute(
      `UPDATE chats
       SET read_status = 1
       WHERE ticket_id = ?
         AND room = ?
         AND receiver_id = ?
         AND read_status = 0`,
      [ticketId, room, req.currentUser.id]
    );

    return { ok: true };
  });
}
