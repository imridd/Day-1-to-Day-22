import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pipeline } from 'node:stream/promises';
import { query, pool } from '../config/db.js';
import { env } from '../config/env.js';
import { httpError, idParam } from '../utils/errors.js';
import { assignSchema, statusSchema, prioritySchema, noteSchema, ticketQuerySchema } from '../schemas/index.js';
import { logHistory } from '../utils/history.js';

export const UPLOAD_ROOT = path.resolve(env.uploadDir);
fs.mkdirSync(UPLOAD_ROOT, { recursive: true });

const ALLOWED_MIME = new Set([
  'image/png', 'image/jpeg', 'image/gif', 'image/webp',
  'application/pdf', 'text/plain', 'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

const CUSTOMER_VISIBLE_HISTORY = new Set(['TICKET_CREATED', 'ASSIGNED', 'PICKED', 'STATUS_CHANGED']);

const BASE = `
  SELECT t.ticket_id, t.subject, t.description, t.category, t.priority, t.status,
         t.customer_id, t.assigned_agent_id, t.created_by_manager, t.created_at, t.updated_at,
         c.name AS customer_name, c.email AS customer_email, a.name AS agent_name
  FROM tickets t
  JOIN users c ON c.id = t.customer_id
  LEFT JOIN users a ON a.id = t.assigned_agent_id`;

async function loadTicket(id) {
  const rows = await query(`${BASE} WHERE t.ticket_id = ?`, [id]);
  return rows[0];
}

/** Manager: any ticket. Customer: own (read only). Agent: only tickets assigned to them. */
function assertAccess(user, ticket, { write = false } = {}) {
  if (!ticket) throw httpError(404, 'Ticket not found');
  if (user.role === 'MANAGER') return;
  if (user.role === 'CUSTOMER' && !write && ticket.customer_id === user.id) return;
  if (user.role === 'AGENT' && ticket.assigned_agent_id === user.id) return;
  throw httpError(403, 'You do not have access to this ticket');
}

export default async function ticketRoutes(app) {
  const auth = [app.authenticate];

  // List tickets
  //  manager : all (?status=)
  //  customer: own
  //  agent   : ?scope=mine (default) assigned to me | ?scope=pool tickets I can pick or that are locked by someone else
  app.get('/', { preHandler: auth }, async (req) => {
    const { status, scope } = ticketQuerySchema.parse(req.query);
    const u = req.currentUser;
    const where = [];
    const params = [];
    if (status) { where.push('t.status = ?'); params.push(status); }

    if (u.role === 'CUSTOMER') {
      where.push('t.customer_id = ?'); params.push(u.id);
    } else if (u.role === 'AGENT') {
      if (scope === 'pool') {
        // Minimal fields only: an agent must not read other agents' ticket contents
        where.push('(t.assigned_agent_id IS NULL OR t.assigned_agent_id <> ?)', "t.status <> 'CLOSED'");
        params.push(u.id);
        const rows = await query(
          `SELECT t.ticket_id, t.subject, t.category, t.priority, t.status, t.created_at, t.assigned_agent_id, a.name AS agent_name
           FROM tickets t LEFT JOIN users a ON a.id = t.assigned_agent_id
           WHERE ${where.join(' AND ')} ORDER BY t.ticket_id DESC LIMIT 500`,
          params
        );
        return rows.map((r) => ({ ...r, locked: r.assigned_agent_id !== null }));
      }
      where.push('t.assigned_agent_id = ?'); params.push(u.id);
    }

    return query(
      `${BASE} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY t.ticket_id DESC LIMIT 500`,
      params
    );
  });

  // Ticket detail with history, notes and attachments
  app.get('/:id', { preHandler: auth }, async (req) => {
    const id = idParam(req.params.id);
    const u = req.currentUser;
    const ticket = await loadTicket(id);
    assertAccess(u, ticket);

    let history = await query(
      `SELECT h.id, h.action, h.details, h.created_at, usr.name AS actor_name
       FROM ticket_history h LEFT JOIN users usr ON usr.id = h.actor_id
       WHERE h.ticket_id = ? ORDER BY h.id DESC`,
      [id]
    );
    if (u.role === 'CUSTOMER') history = history.filter((h) => CUSTOMER_VISIBLE_HISTORY.has(h.action));

    let notes = [];
    let attachments = [];
    if (u.role !== 'CUSTOMER') {
      notes = await query(
        `SELECT n.id, n.note, n.created_at, usr.name AS agent_name
         FROM ticket_notes n JOIN users usr ON usr.id = n.agent_id
         WHERE n.ticket_id = ? ORDER BY n.id DESC`,
        [id]
      );
      attachments = await query(
        `SELECT a.id, a.original_name, a.mime_type, a.size, a.created_at, usr.name AS uploaded_by_name
         FROM ticket_attachments a JOIN users usr ON usr.id = a.uploaded_by
         WHERE a.ticket_id = ? ORDER BY a.id DESC`,
        [id]
      );
    }
    return { ticket, history, notes, attachments };
  });

  // Agent picks an unassigned ticket. The conditional UPDATE is atomic, so two agents
  // clicking at the same moment cannot both win.
  app.post('/:id/pick', { preHandler: [...auth, app.authorize('AGENT')] }, async (req) => {
    const id = idParam(req.params.id);
    const agent = req.currentUser;
    const [res] = await pool.execute(
      "UPDATE tickets SET assigned_agent_id = ? WHERE ticket_id = ? AND assigned_agent_id IS NULL AND status <> 'CLOSED'",
      [agent.id, id]
    );
    if (res.affectedRows === 0) {
      const t = await loadTicket(id);
      if (!t) throw httpError(404, 'Ticket not found');
      if (t.assigned_agent_id === agent.id) throw httpError(409, 'You already picked this ticket');
      if (t.assigned_agent_id) throw httpError(409, `Assigned to ${t.agent_name}`);
      throw httpError(409, 'This ticket is closed');
    }
    await logHistory(id, agent.id, 'PICKED', `Picked by ${agent.name}`);
    return loadTicket(id);
  });

  // Manager assigns / reassigns / unassigns (agentId: null)
  app.patch('/:id/assign', { preHandler: [...auth, app.authorize('MANAGER')] }, async (req) => {
    const id = idParam(req.params.id);
    const { agentId } = assignSchema.parse(req.body);
    const ticket = await loadTicket(id);
    if (!ticket) throw httpError(404, 'Ticket not found');

    let details = 'Unassigned';
    if (agentId) {
      const rows = await query(
        "SELECT id, name FROM users WHERE id = ? AND role = 'AGENT' AND status = 'ACTIVE'",
        [agentId]
      );
      if (!rows[0]) throw httpError(400, 'Agent not found or disabled');
      details = `Assigned to ${rows[0].name}`;
    }
    await query('UPDATE tickets SET assigned_agent_id = ? WHERE ticket_id = ?', [agentId, id]);
    await logHistory(id, req.currentUser.id, 'ASSIGNED', details);
    return loadTicket(id);
  });

  // Priority is controlled by managers. Agents can see it through ticket list/detail APIs.
  app.patch('/:id/priority', { preHandler: [...auth, app.authorize('MANAGER')] }, async (req) => {
    const id = idParam(req.params.id);
    const { priority } = prioritySchema.parse(req.body);
    const ticket = await loadTicket(id);
    if (!ticket) throw httpError(404, 'Ticket not found');
    if (ticket.priority === priority) return ticket;

    await query('UPDATE tickets SET priority = ? WHERE ticket_id = ?', [priority, id]);
    await logHistory(id, req.currentUser.id, 'PRIORITY_CHANGED', `${ticket.priority} -> ${priority}`);
    return loadTicket(id);
  });

  // Status change: manager, or the agent who owns the ticket
  app.patch('/:id/status', { preHandler: [...auth, app.authorize('MANAGER', 'AGENT')] }, async (req) => {
    const id = idParam(req.params.id);
    const { status } = statusSchema.parse(req.body);
    const ticket = await loadTicket(id);
    assertAccess(req.currentUser, ticket, { write: true });
    if (ticket.status === status) return ticket;
    await query('UPDATE tickets SET status = ? WHERE ticket_id = ?', [status, id]);
    await logHistory(id, req.currentUser.id, 'STATUS_CHANGED', `${ticket.status} -> ${status}`);
    return loadTicket(id);
  });

  // Agent notes
  app.post('/:id/notes', { preHandler: [...auth, app.authorize('AGENT')] }, async (req, reply) => {
    const id = idParam(req.params.id);
    const { note } = noteSchema.parse(req.body);
    assertAccess(req.currentUser, await loadTicket(id), { write: true });
    await query('INSERT INTO ticket_notes (ticket_id, agent_id, note) VALUES (?, ?, ?)', [id, req.currentUser.id, note]);
    await logHistory(id, req.currentUser.id, 'NOTE_ADDED', null);
    return reply.code(201).send({ message: 'Note added' });
  });

  // Agent attachment upload (5 MB, whitelisted types, random stored name)
  app.post('/:id/attachments', { preHandler: [...auth, app.authorize('AGENT')] }, async (req, reply) => {
    const id = idParam(req.params.id);
    assertAccess(req.currentUser, await loadTicket(id), { write: true });

    const file = await req.file();
    if (!file) throw httpError(400, 'No file uploaded');
    if (!ALLOWED_MIME.has(file.mimetype)) {
      file.file.resume();
      throw httpError(415, 'File type not allowed');
    }
    const ext = path.extname(file.filename).toLowerCase().replace(/[^.a-z0-9]/g, '').slice(0, 10);
    const stored = crypto.randomUUID() + ext;
    const dest = path.join(UPLOAD_ROOT, stored);

    await pipeline(file.file, fs.createWriteStream(dest));
    if (file.file.truncated) {
      await fs.promises.unlink(dest).catch(() => {});
      throw httpError(413, 'File is too large (max 5 MB)');
    }
    const { size } = await fs.promises.stat(dest);
    await query(
      `INSERT INTO ticket_attachments (ticket_id, uploaded_by, original_name, stored_name, mime_type, size)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, req.currentUser.id, file.filename.slice(0, 255), stored, file.mimetype, size]
    );
    await logHistory(id, req.currentUser.id, 'ATTACHMENT_ADDED', file.filename.slice(0, 200));
    return reply.code(201).send({ message: 'File uploaded' });
  });
}
