
import pool from '../config/database.js';

import {
  createNotification,
  notifyManagers
} from '../utils/notificationService.js';

const isValidId = value =>
  /^[1-9]\d*$/.test(String(value));

const sameId = (a, b) =>
  a != null && b != null && String(a) === String(b);

async function rollbackAndReply(
  connection,
  reply,
  statusCode,
  message
) {
  await connection.rollback();

  return reply.code(statusCode).send({
    success: false,
    message
  });
}

async function ticketMessageRoutes(fastify) {

  // GET TICKET MESSAGES
  fastify.get(
    '/:ticketId/messages',
    {
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {
      const { ticketId } = request.params;
      const user = request.user;

      if (!isValidId(ticketId)) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid ticket ID'
        });
      }

      if (!['Manager', 'Agent', 'Customer'].includes(user.role)) {
        return reply.code(403).send({
          success: false,
          message: 'You do not have permission to view messages'
        });
      }

      try {
        const [tickets] = await pool.execute(
          `SELECT
             ticket_id,
             customer_id,
             assigned_agent_id
           FROM tickets
           WHERE ticket_id = ?
           LIMIT 1`,
          [ticketId]
        );

        if (tickets.length === 0) {
          return reply.code(404).send({
            success: false,
            message: 'Ticket not found'
          });
        }

        const ticket = tickets[0];

        // CUSTOMER ACCESS
        if (user.role === 'Customer') {
          if (!sameId(ticket.customer_id, user.customerId)) {
            return reply.code(403).send({
              success: false,
              message: 'You cannot access this ticket'
            });
          }
        }

        // STAFF ACCESS
        if (user.role === 'Manager' || user.role === 'Agent') {
          const [agents] = await pool.execute(
            `SELECT agent_id, role, is_active
             FROM agents
             WHERE agent_id = ?
             LIMIT 1`,
            [user.agentId]
          );

          if (
            agents.length === 0 ||
            agents[0].role !== user.role ||
            !agents[0].is_active
          ) {
            return reply.code(403).send({
              success: false,
              message: 'Your staff account is inactive or invalid'
            });
          }

          if (
            user.role === 'Agent' &&
            !sameId(ticket.assigned_agent_id, user.agentId)
          ) {
            return reply.code(403).send({
              success: false,
              message: 'Only the assigned Agent can access this chat'
            });
          }
        }

        // PAGINATION
        const requestedLimit = Number(request.query?.limit ?? 50);

        const limit = Number.isInteger(requestedLimit)
          ? Math.min(Math.max(requestedLimit, 1), 100)
          : 50;

        const beforeId = request.query?.beforeMessageId;

        if (
          beforeId !== undefined &&
          !isValidId(beforeId)
        ) {
          return reply.code(400).send({
            success: false,
            message: 'Invalid beforeMessageId'
          });
        }

        let sql = `
          SELECT
            m.message_id,
            m.ticket_id,
            m.sender_type,
            m.sender_customer_id,
            m.sender_agent_id,
            m.visibility,
            m.message_text,
            m.created_at,

            CASE
              WHEN m.sender_type = 'Customer'
                THEN customer.full_name
              ELSE agent.full_name
            END AS sender_name

          FROM ticket_messages m

          LEFT JOIN customers customer
            ON customer.customer_id = m.sender_customer_id

          LEFT JOIN agents agent
            ON agent.agent_id = m.sender_agent_id

          WHERE m.ticket_id = ?
        `;

        const params = [ticketId];

        // Customers must never see internal messages.
        if (user.role === 'Customer') {
          sql += ` AND m.visibility = 'Customer'`;
        }

        if (beforeId !== undefined) {
          sql += ` AND m.message_id < ?`;
          params.push(beforeId);
        }

        sql += `
          ORDER BY m.message_id DESC
          LIMIT ?
        `;

        params.push(limit);

        const [messages] = await pool.execute(sql, params);

        // Return messages chronologically.
        messages.reverse();

        return reply.code(200).send({
          success: true,
          ticket_id: String(ticketId),
          total: messages.length,
          messages
        });

      } catch (error) {
        fastify.log.error(error);

        return reply.code(500).send({
          success: false,
          message: 'Unable to retrieve ticket messages'
        });
      }
    }
  );


  // SEND TICKET MESSAGE
  fastify.post(
    '/:ticketId/messages',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          required: ['message_text'],
          additionalProperties: false,
          properties: {
            message_text: {
              type: 'string',
              minLength: 1,
              maxLength: 10000
            },
            visibility: {
              type: 'string',
              enum: ['Customer', 'Internal']
            }
          }
        }
      }
    },
    async (request, reply) => {
      const { ticketId } = request.params;
      const user = request.user;

      const {
        message_text,
        visibility = 'Customer'
      } = request.body;

      if (!isValidId(ticketId)) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid ticket ID'
        });
      }

      const trimmedMessage = message_text.trim();

      if (
        !trimmedMessage ||
        trimmedMessage.length > 10000
      ) {
        return reply.code(400).send({
          success: false,
          message: 'Message must contain between 1 and 10000 characters'
        });
      }

      if (!['Manager', 'Agent', 'Customer'].includes(user.role)) {
        return reply.code(403).send({
          success: false,
          message: 'You cannot send messages'
        });
      }

      // Customers cannot send internal messages.
      if (
        user.role === 'Customer' &&
        visibility !== 'Customer'
      ) {
        return reply.code(403).send({
          success: false,
          message: 'Customers cannot send internal messages'
        });
      }

      const connection = await pool.getConnection();
      let transactionStarted = false;

      try {
        await connection.beginTransaction();
        transactionStarted = true;

        // Lock ticket while validating and inserting.
        const [tickets] = await connection.execute(
          `SELECT
             ticket_id,
             customer_id,
             assigned_agent_id,
             title
           FROM tickets
           WHERE ticket_id = ?
           FOR UPDATE`,
          [ticketId]
        );

        if (tickets.length === 0) {
          const response = await rollbackAndReply(
            connection,
            reply,
            404,
            'Ticket not found'
          );

          transactionStarted = false;
          return response;
        }

        const ticket = tickets[0];

        let senderType;
        let senderCustomerId = null;
        let senderAgentId = null;
        let messageVisibility = visibility;

        // CUSTOMER MESSAGE
        if (user.role === 'Customer') {
          if (!sameId(ticket.customer_id, user.customerId)) {
            const response = await rollbackAndReply(
              connection,
              reply,
              403,
              'You cannot send messages to this ticket'
            );

            transactionStarted = false;
            return response;
          }

          senderType = 'Customer';
          senderCustomerId = user.customerId;
          messageVisibility = 'Customer';

        } else {
          // STAFF ACCOUNT VALIDATION
          const [agents] = await connection.execute(
            `SELECT agent_id, role, is_active
             FROM agents
             WHERE agent_id = ?
             FOR UPDATE`,
            [user.agentId]
          );

          if (
            agents.length === 0 ||
            agents[0].role !== user.role ||
            !agents[0].is_active
          ) {
            const response = await rollbackAndReply(
              connection,
              reply,
              403,
              'Your staff account is inactive or invalid'
            );

            transactionStarted = false;
            return response;
          }

          // AGENT ACCESS
          if (
            user.role === 'Agent' &&
            !sameId(ticket.assigned_agent_id, user.agentId)
          ) {
            const response = await rollbackAndReply(
              connection,
              reply,
              403,
              'Only the assigned Agent can send messages'
            );

            transactionStarted = false;
            return response;
          }

          senderType = 'Staff';
          senderAgentId = user.agentId;
        }

        // INSERT MESSAGE
        const [result] = await connection.execute(
          `INSERT INTO ticket_messages (
             ticket_id,
             sender_type,
             sender_customer_id,
             sender_agent_id,
             visibility,
             message_text
           )
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            ticketId,
            senderType,
            senderCustomerId,
            senderAgentId,
            messageVisibility,
            trimmedMessage
          ]
        );

        // NOTIFICATIONS
        if (senderType === 'Customer') {
          // Notify the assigned Agent, if one exists.
          if (ticket.assigned_agent_id !== null) {
            await createNotification({
              agentId: ticket.assigned_agent_id,
              ticketId,
              type: 'NEW_CUSTOMER_MESSAGE',
              title: 'New customer message',
              message: `A customer sent a message on ticket "${ticket.title}".`,
              connection
            });
          }

          // Managers can monitor new customer messages.
          await notifyManagers({
            ticketId,
            type: 'NEW_CUSTOMER_MESSAGE',
            title: 'New customer message',
            message: `A customer sent a message on ticket "${ticket.title}".`,
            connection
          });

        } else if (messageVisibility === 'Customer') {
          // Customer-visible staff messages notify the Customer.
          await createNotification({
            customerId: ticket.customer_id,
            ticketId,
            type: 'NEW_STAFF_MESSAGE',
            title: 'New support message',
            message: `Support has sent you a message on ticket "${ticket.title}".`,
            connection
          });

        } else if (user.role === 'Manager') {
          // An internal Manager message notifies the assigned Agent.
          if (
            ticket.assigned_agent_id !== null &&
            !sameId(ticket.assigned_agent_id, senderAgentId)
          ) {
            await createNotification({
              agentId: ticket.assigned_agent_id,
              ticketId,
              type: 'NEW_INTERNAL_MESSAGE',
              title: 'New internal ticket message',
              message: `A Manager added an internal message to ticket "${ticket.title}".`,
              connection
            });
          }

        } else if (user.role === 'Agent') {
          // Internal Agent messages notify active Managers.
          await notifyManagers({
            ticketId,
            type: 'NEW_INTERNAL_MESSAGE',
            title: 'New internal ticket message',
            message: `An Agent added an internal message to ticket "${ticket.title}".`,
            connection
          });
        }

        await connection.commit();
        transactionStarted = false;

        return reply.code(201).send({
          success: true,
          message: 'Message sent successfully',
          data: {
            message_id: String(result.insertId),
            ticket_id: String(ticketId),
            sender_type: senderType,
            sender_customer_id: senderCustomerId,
            sender_agent_id: senderAgentId,
            visibility: messageVisibility,
            message_text: trimmedMessage
          }
        });

      } catch (error) {
        if (transactionStarted) {
          try {
            await connection.rollback();
          } catch (rollbackError) {
            fastify.log.error(rollbackError);
          }
        }

        fastify.log.error(error);

        return reply.code(500).send({
          success: false,
          message: 'Unable to send ticket message'
        });

      } finally {
        connection.release();
      }
    }
  );

}

export default ticketMessageRoutes;
