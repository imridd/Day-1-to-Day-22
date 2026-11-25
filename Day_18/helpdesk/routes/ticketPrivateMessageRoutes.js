
import pool from '../config/database.js';

const isValidId = value =>
  /^[1-9]\d*$/.test(String(value));

async function ticketPrivateMessageRoutes(fastify) {

  // GET PRIVATE CHAT HISTORY
  fastify.get(
    '/:ticketId/private-messages',
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

      if (!['Manager', 'Agent'].includes(user.role)) {
        return reply.code(403).send({
          success: false,
          message: 'Only staff can access private messages'
        });
      }

      const agentId = Number(user.agentId);

      if (!Number.isSafeInteger(agentId) || agentId < 1) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid staff account information'
        });
      }

      const requestedLimit = Number(
        request.query?.limit ?? 50
      );

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

      try {
        // Verify active staff account.
        const [agents] = await pool.execute(
          `SELECT agent_id, role, is_active
           FROM agents
           WHERE agent_id = ?
           LIMIT 1`,
          [agentId]
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

        // Verify ticket exists.
        const [tickets] = await pool.execute(
          `SELECT ticket_id
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

        // The column is selected only from fixed server-side values.
        const participantColumn =
          user.role === 'Manager'
            ? 'manager_agent_id'
            : 'assigned_agent_id';

        let sql = `
          SELECT
            m.private_message_id,
            m.ticket_id,
            m.manager_agent_id,
            m.assigned_agent_id,
            m.sender_agent_id,
            sender.full_name AS sender_name,
            m.message_text,
            m.created_at,
            m.read_at

          FROM ticket_private_messages m

          INNER JOIN agents sender
            ON sender.agent_id = m.sender_agent_id

          WHERE m.ticket_id = ?
            AND m.${participantColumn} = ?
        `;

        const params = [ticketId, agentId];

        if (beforeId !== undefined) {
          sql += `
            AND m.private_message_id < ?
          `;
          params.push(beforeId);
        }

        sql += `
          ORDER BY m.private_message_id DESC
          LIMIT ?
        `;

        params.push(limit);

        const [messages] = await pool.execute(sql, params);

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
          message: 'Unable to retrieve private chat history'
        });
      }
    }
  );


  // MARK A PRIVATE MESSAGE AS READ
  fastify.patch(
    '/:ticketId/private-messages/:messageId/read',
    {
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {

      const { ticketId, messageId } = request.params;
      const user = request.user;

      if (
        !isValidId(ticketId) ||
        !isValidId(messageId)
      ) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid ticket ID or message ID'
        });
      }

      if (!['Manager', 'Agent'].includes(user.role)) {
        return reply.code(403).send({
          success: false,
          message: 'Only staff can update private message read receipts'
        });
      }

      const agentId = Number(user.agentId);

      if (!Number.isSafeInteger(agentId) || agentId < 1) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid staff account information'
        });
      }

      const participantColumn =
        user.role === 'Manager'
          ? 'manager_agent_id'
          : 'assigned_agent_id';

      const connection = await pool.getConnection();
      let transactionStarted = false;

      try {
        await connection.beginTransaction();
        transactionStarted = true;

        // Verify and lock the staff account.
        const [agents] = await connection.execute(
          `SELECT agent_id, role, is_active
           FROM agents
           WHERE agent_id = ?
           FOR UPDATE`,
          [agentId]
        );

        if (
          agents.length === 0 ||
          agents[0].role !== user.role ||
          !agents[0].is_active
        ) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(403).send({
            success: false,
            message: 'Your staff account is inactive or invalid'
          });
        }

        // Only the Manager or Agent belonging to this
        // particular pairing can mark the message as read.
        const [messages] = await connection.execute(
          `SELECT
             private_message_id,
             sender_agent_id,
             read_at
           FROM ticket_private_messages
           WHERE private_message_id = ?
             AND ticket_id = ?
             AND ${participantColumn} = ?
           FOR UPDATE`,
          [
            messageId,
            ticketId,
            agentId
          ]
        );

        if (messages.length === 0) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(404).send({
            success: false,
            message: 'Private message not found or access denied'
          });
        }

        const message = messages[0];

        // Sender cannot mark their own message as read.
        if (String(message.sender_agent_id) === String(agentId)) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(400).send({
            success: false,
            message: 'You cannot mark your own message as read'
          });
        }

        if (message.read_at !== null) {
          await connection.commit();
          transactionStarted = false;

          return reply.code(200).send({
            success: true,
            message: 'Message was already marked as read',
            read_at: message.read_at
          });
        }

        await connection.execute(
          `UPDATE ticket_private_messages
           SET read_at = CURRENT_TIMESTAMP
           WHERE private_message_id = ?
             AND read_at IS NULL`,
          [messageId]
        );

        const [updatedMessages] = await connection.execute(
          `SELECT read_at
           FROM ticket_private_messages
           WHERE private_message_id = ?`,
          [messageId]
        );

        await connection.commit();
        transactionStarted = false;

        return reply.code(200).send({
          success: true,
          message: 'Private message marked as read',
          read_at: updatedMessages[0].read_at
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
          message: 'Unable to update private message read receipt'
        });

      } finally {
        connection.release();
      }
    }
  );

}

export default ticketPrivateMessageRoutes;
