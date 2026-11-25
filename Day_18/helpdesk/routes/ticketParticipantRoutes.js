
import pool from '../config/database.js';

const isValidId = value =>
  /^[1-9]\d*$/.test(String(value));

async function ticketParticipantRoutes(fastify) {

  // START A PRIVATE MANAGER-AGENT CHAT PAIRING
  fastify.post(
    '/:ticketId/chat-participants',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          properties: {
            handover_reason: {
              anyOf: [
                { type: 'string', maxLength: 500 },
                { type: 'null' }
              ]
            }
          }
        }
      }
    },
    async (request, reply) => {

      const { ticketId } = request.params;
      const user = request.user;

      if (user.role !== 'Manager') {
        return reply.code(403).send({
          success: false,
          message: 'Only Managers can create chat pairings'
        });
      }

      if (!isValidId(ticketId)) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid ticket ID'
        });
      }

      const managerId = Number(user.agentId);

      if (!Number.isSafeInteger(managerId) || managerId < 1) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid Manager account information'
        });
      }

      const handoverReason =
        request.body?.handover_reason ?? null;

      if (
        handoverReason !== null &&
        typeof handoverReason !== 'string'
      ) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid handover reason'
        });
      }

      const connection = await pool.getConnection();
      let transactionStarted = false;

      try {
        await connection.beginTransaction();
        transactionStarted = true;

        // Lock the ticket first. Keep this lock order consistent
        // with the ticket-claim operation.
        const [tickets] = await connection.execute(
          `SELECT
             ticket_id,
             assigned_agent_id
           FROM tickets
           WHERE ticket_id = ?
           FOR UPDATE`,
          [ticketId]
        );

        if (tickets.length === 0) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(404).send({
            success: false,
            message: 'Ticket not found'
          });
        }

        const ticket = tickets[0];

        // Verify and lock the Manager.
        const [managers] = await connection.execute(
          `SELECT
             agent_id,
             role,
             is_active
           FROM agents
           WHERE agent_id = ?
           FOR UPDATE`,
          [managerId]
        );

        if (
          managers.length === 0 ||
          managers[0].role !== 'Manager' ||
          !managers[0].is_active
        ) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(403).send({
            success: false,
            message: 'Manager account is inactive or invalid'
          });
        }

        const assignedAgentId = ticket.assigned_agent_id;

        if (assignedAgentId === null) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(409).send({
            success: false,
            message: 'Assign an Agent before starting a private chat'
          });
        }

        // Verify and lock the assigned Agent.
        const [agents] = await connection.execute(
          `SELECT
             agent_id,
             role,
             is_active
           FROM agents
           WHERE agent_id = ?
           FOR UPDATE`,
          [assignedAgentId]
        );

        if (
          agents.length === 0 ||
          agents[0].role !== 'Agent' ||
          !agents[0].is_active
        ) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(409).send({
            success: false,
            message: 'The assigned Agent is inactive or invalid'
          });
        }

        // Check all currently active pairings.
        const [activePairings] = await connection.execute(
          `SELECT
             chat_participant_id,
             manager_agent_id,
             assigned_agent_id
           FROM ticket_chat_participants
           WHERE ticket_id = ?
             AND ended_at IS NULL
           FOR UPDATE`,
          [ticketId]
        );

        const samePairing =
          activePairings.length === 1 &&
          String(activePairings[0].manager_agent_id) === String(managerId) &&
          String(activePairings[0].assigned_agent_id) === String(assignedAgentId);

        if (samePairing) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(409).send({
            success: false,
            message: 'This private chat pairing is already active'
          });
        }

        // Close previous active pairings before creating a new one.
        if (activePairings.length > 0) {
          await connection.execute(
            `UPDATE ticket_chat_participants
             SET ended_at = CURRENT_TIMESTAMP
             WHERE ticket_id = ?
               AND ended_at IS NULL`,
            [ticketId]
          );
        }

        const [result] = await connection.execute(
          `INSERT INTO ticket_chat_participants (
             ticket_id,
             manager_agent_id,
             assigned_agent_id,
             handover_reason
           )
           VALUES (?, ?, ?, ?)`,
          [
            ticketId,
            managerId,
            assignedAgentId,
            handoverReason?.trim() || null
          ]
        );

        await connection.commit();
        transactionStarted = false;

        return reply.code(201).send({
          success: true,
          message: 'Private chat pairing created successfully',
          data: {
            chat_participant_id: String(result.insertId),
            ticket_id: String(ticketId),
            manager_agent_id: managerId,
            assigned_agent_id: Number(assignedAgentId),
            handover_reason: handoverReason?.trim() || null
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
          message: 'Unable to create private chat pairing'
        });

      } finally {
        connection.release();
      }
    }
  );


  // GET PRIVATE CHAT PAIRING HISTORY
  fastify.get(
    '/:ticketId/chat-participants',
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
          message: 'Only staff can view private chat pairings'
        });
      }

      try {
        // Validate active staff account for both roles.
        const [agents] = await pool.execute(
          `SELECT
             agent_id,
             role,
             is_active
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

        const [tickets] = await pool.execute(
          `SELECT
             ticket_id,
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

        // Agents can only view pairing history for tickets
        // currently assigned to them.
        if (
          user.role === 'Agent' &&
          String(tickets[0].assigned_agent_id) !== String(user.agentId)
        ) {
          return reply.code(403).send({
            success: false,
            message: 'Only the assigned Agent can view these pairings'
          });
        }

        const [participants] = await pool.execute(
          `SELECT
             p.chat_participant_id,
             p.ticket_id,

             p.manager_agent_id,
             manager.full_name AS manager_name,

             p.assigned_agent_id,
             agent.full_name AS assigned_agent_name,

             p.started_at,
             p.ended_at,
             p.handover_reason

           FROM ticket_chat_participants p

           INNER JOIN agents manager
             ON manager.agent_id = p.manager_agent_id

           INNER JOIN agents agent
             ON agent.agent_id = p.assigned_agent_id

           WHERE p.ticket_id = ?

           ORDER BY
             p.started_at ASC,
             p.chat_participant_id ASC`,
          [ticketId]
        );

        return reply.code(200).send({
          success: true,
          ticket_id: String(ticketId),
          total: participants.length,
          participants
        });

      } catch (error) {
        fastify.log.error(error);

        return reply.code(500).send({
          success: false,
          message: 'Unable to retrieve chat participants'
        });
      }
    }
  );

}

export default ticketParticipantRoutes;
