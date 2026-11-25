
import pool from '../config/database.js';

function getRecipient(user) {
  if (user.role === 'Customer') {
    const customerId = Number(user.customerId);

    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      return null;
    }

    return {
      column: 'recipient_customer_id',
      id: customerId,
      role: 'Customer'
    };
  }

  if (user.role === 'Agent' || user.role === 'Manager') {
    const agentId = Number(user.agentId);

    if (!Number.isSafeInteger(agentId) || agentId <= 0) {
      return null;
    }

    return {
      column: 'recipient_agent_id',
      id: agentId,
      role: user.role
    };
  }

  return null;
}

async function validateRecipient(recipient) {
  if (recipient.role === 'Customer') {
    const [rows] = await pool.execute(
      `SELECT customer_id
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [recipient.id]
    );

    return rows.length > 0;
  }

  const [rows] = await pool.execute(
    `SELECT agent_id
     FROM agents
     WHERE agent_id = ?
       AND role = ?
       AND is_active = TRUE
     LIMIT 1`,
    [recipient.id, recipient.role]
  );

  return rows.length > 0;
}

async function notificationRoutes(fastify) {

  // GET NOTIFICATIONS
  fastify.get(
    '/',
    {
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {
      const recipient = getRecipient(request.user);

      if (!recipient) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid user identity'
        });
      }

      try {
        const isValid = await validateRecipient(recipient);

        if (!isValid) {
          return reply.code(403).send({
            success: false,
            message: 'Your account is inactive or unavailable'
          });
        }

        const requestedLimit = Number(
          request.query?.limit ?? 20
        );

        if (
          !Number.isInteger(requestedLimit) ||
          requestedLimit < 1
        ) {
          return reply.code(400).send({
            success: false,
            message: 'Limit must be a positive integer'
          });
        }

        const limit = Math.min(requestedLimit, 100);
        const unreadOnly = request.query?.unreadOnly;
        const beforeId = request.query?.beforeNotificationId;

        if (
          unreadOnly !== undefined &&
          unreadOnly !== 'true' &&
          unreadOnly !== 'false'
        ) {
          return reply.code(400).send({
            success: false,
            message: 'unreadOnly must be true or false'
          });
        }

        if (
          beforeId !== undefined &&
          !/^[1-9]\d*$/.test(String(beforeId))
        ) {
          return reply.code(400).send({
            success: false,
            message: 'Invalid beforeNotificationId'
          });
        }

        let sql = `
          SELECT
            notification_id,
            related_ticket_id,
            notification_type,
            title,
            message,
            is_read,
            created_at,
            read_at
          FROM notifications
          WHERE ${recipient.column} = ?
        `;

        const params = [recipient.id];

        if (unreadOnly === 'true') {
          sql += ` AND is_read = FALSE`;
        }

        if (beforeId !== undefined) {
          sql += ` AND notification_id < ?`;
          params.push(beforeId);
        }

        sql += `
          ORDER BY notification_id DESC
          LIMIT ?
        `;

        params.push(limit);

        const [notifications] = await pool.execute(sql, params);

        const [countRows] = await pool.execute(
          `SELECT COUNT(*) AS unread_count
           FROM notifications
           WHERE ${recipient.column} = ?
             AND is_read = FALSE`,
          [recipient.id]
        );

        return reply.code(200).send({
          success: true,
          count: notifications.length,
          unread_count: Number(countRows[0].unread_count),
          notifications
        });

      } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
          success: false,
          message: 'Unable to retrieve notifications'
        });
      }
    }
  );


  // GET UNREAD COUNT
  fastify.get(
    '/unread-count',
    {
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {
      const recipient = getRecipient(request.user);

      if (!recipient) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid user identity'
        });
      }

      try {
        const isValid = await validateRecipient(recipient);

        if (!isValid) {
          return reply.code(403).send({
            success: false,
            message: 'Your account is inactive or unavailable'
          });
        }

        const [rows] = await pool.execute(
          `SELECT COUNT(*) AS unread_count
           FROM notifications
           WHERE ${recipient.column} = ?
             AND is_read = FALSE`,
          [recipient.id]
        );

        return reply.code(200).send({
          success: true,
          unread_count: Number(rows[0].unread_count)
        });

      } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
          success: false,
          message: 'Unable to retrieve unread notification count'
        });
      }
    }
  );


  // MARK ONE NOTIFICATION AS READ
  fastify.patch(
    '/:notificationId/read',
    {
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {
      const recipient = getRecipient(request.user);
      const { notificationId } = request.params;

      if (!recipient) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid user identity'
        });
      }

      if (!/^[1-9]\d*$/.test(String(notificationId))) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid notification ID'
        });
      }

      try {
        const isValid = await validateRecipient(recipient);

        if (!isValid) {
          return reply.code(403).send({
            success: false,
            message: 'Your account is inactive or unavailable'
          });
        }

        const [result] = await pool.execute(
          `UPDATE notifications
           SET is_read = TRUE,
               read_at = COALESCE(read_at, CURRENT_TIMESTAMP)
           WHERE notification_id = ?
             AND ${recipient.column} = ?`,
          [notificationId, recipient.id]
        );

        if (result.affectedRows === 0) {
          const [existing] = await pool.execute(
            `SELECT notification_id
             FROM notifications
             WHERE notification_id = ?
               AND ${recipient.column} = ?
             LIMIT 1`,
            [notificationId, recipient.id]
          );

          if (existing.length === 0) {
            return reply.code(404).send({
              success: false,
              message: 'Notification not found'
            });
          }
        }

        return reply.code(200).send({
          success: true,
          message: 'Notification marked as read'
        });

      } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
          success: false,
          message: 'Unable to mark notification as read'
        });
      }
    }
  );


  // MARK ALL NOTIFICATIONS AS READ
  fastify.patch(
    '/read-all',
    {
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {
      const recipient = getRecipient(request.user);

      if (!recipient) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid user identity'
        });
      }

      try {
        const isValid = await validateRecipient(recipient);

        if (!isValid) {
          return reply.code(403).send({
            success: false,
            message: 'Your account is inactive or unavailable'
          });
        }

        const [result] = await pool.execute(
          `UPDATE notifications
           SET is_read = TRUE,
               read_at = CURRENT_TIMESTAMP
           WHERE ${recipient.column} = ?
             AND is_read = FALSE`,
          [recipient.id]
        );

        return reply.code(200).send({
          success: true,
          message: 'All notifications marked as read',
          updated_count: result.affectedRows
        });

      } catch (error) {
        request.log.error(error);

        return reply.code(500).send({
          success: false,
          message: 'Unable to mark notifications as read'
        });
      }
    }
  );

}

export default notificationRoutes;
