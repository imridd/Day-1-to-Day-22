
import pool from '../config/database.js';

import {
  createNotification,
  notifyManagers
} from '../utils/notificationService.js';

const isValidId = value =>
  /^[1-9]\d*$/.test(String(value));

async function ticketClaimRoutes(fastify) {

  fastify.post(
    '/:ticketId/claim',
    {
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {
      const { ticketId } = request.params;
      const user = request.user;

      if (user.role !== 'Agent') {
        return reply.code(403).send({
          success: false,
          message: 'Only Agents can claim tickets'
        });
      }

      if (!isValidId(ticketId)) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid ticket ID'
        });
      }

      const agentId = Number(user.agentId);

      if (
        !Number.isSafeInteger(agentId) ||
        agentId <= 0
      ) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid Agent account information'
        });
      }

      const connection = await pool.getConnection();
      let transactionStarted = false;

      try {
        await connection.beginTransaction();
        transactionStarted = true;

        // STEP 1: Lock the ticket first.
        const [tickets] = await connection.execute(
          `SELECT
             ticket_id,
             customer_id,
             department_id,
             assigned_agent_id,
             title,
             status
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

        // STEP 2: Lock and validate the Agent.
        const [agents] = await connection.execute(
          `SELECT
             agent_id,
             department_id,
             role,
             is_active
           FROM agents
           WHERE agent_id = ?
           FOR UPDATE`,
          [agentId]
        );

        if (
          agents.length === 0 ||
          agents[0].role !== 'Agent' ||
          !agents[0].is_active
        ) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(403).send({
            success: false,
            message: 'Your Agent account is inactive or invalid'
          });
        }

        const agent = agents[0];

        // STEP 3: Check ticket status.
        if (ticket.status !== 'Open') {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(409).send({
            success: false,
            message: 'Only Open tickets can be claimed'
          });
        }

        // STEP 4: Check existing assignment.
        if (ticket.assigned_agent_id !== null) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(409).send({
            success: false,
            message: 'This ticket has already been assigned'
          });
        }

        // STEP 5: Check department.
        if (
          Number(ticket.department_id) !==
          Number(agent.department_id)
        ) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(403).send({
            success: false,
            message: 'You cannot claim tickets from another department'
          });
        }

        // STEP 6: Assign the ticket.
        await connection.execute(
          `UPDATE tickets
           SET
             assigned_agent_id = ?,
             updated_at = CURRENT_TIMESTAMP
           WHERE ticket_id = ?`,
          [agentId, ticketId]
        );

        // STEP 7: Record assignment history.
        await connection.execute(
          `INSERT INTO ticket_history (
             ticket_id,
             changed_by_agent_id,
             action_type,
             old_assigned_agent_id,
             new_assigned_agent_id,
             change_note
           )
           VALUES (?, ?, 'ASSIGNMENT_CHANGE', NULL, ?, ?)`,
          [
            ticketId,
            agentId,
            agentId,
            'Ticket claimed by Agent'
          ]
        );

        // STEP 8: Notify Customer.
        await createNotification({
          customerId: ticket.customer_id,
          ticketId,
          type: 'TICKET_CLAIMED',
          title: 'Agent assigned to your ticket',
          message: `An Agent has claimed your ticket "${ticket.title}".`,
          connection
        });

        // STEP 9: Notify all active Managers.
        await notifyManagers({
          ticketId,
          type: 'TICKET_CLAIMED',
          title: 'Ticket claimed by Agent',
          message: `Agent ${agentId} has claimed ticket "${ticket.title}".`,
          connection
        });

        // STEP 10: Commit assignment, history and notifications.
        await connection.commit();
        transactionStarted = false;

        return reply.code(200).send({
          success: true,
          message: 'Ticket claimed successfully',
          ticket: {
            ticket_id: String(ticketId),
            customer_id: ticket.customer_id,
            assigned_agent_id: agentId,
            department_id: ticket.department_id,
            status: ticket.status
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
          message: 'Unable to claim ticket'
        });

      } finally {
        connection.release();
      }
    }
  );

}

export default ticketClaimRoutes;
