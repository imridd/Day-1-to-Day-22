
import pool from '../config/database.js';

import {
  createNotification,
  notifyManagers
} from '../utils/notificationService.js';

const isValidId = value =>
  /^[1-9]\d*$/.test(String(value));

async function customerTicketStatusRoutes(fastify) {

  // CLOSE A RESOLVED TICKET
  fastify.patch(
    '/customer/:ticketId/close',
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize('Customer')
      ]
    },
    async (request, reply) => {
      const { ticketId } = request.params;
      const customerId = Number(request.user.customerId);

      if (!isValidId(ticketId)) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid ticket ID'
        });
      }

      if (!Number.isSafeInteger(customerId) || customerId < 1) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid customer account information'
        });
      }

      const connection = await pool.getConnection();
      let transactionStarted = false;

      try {
        await connection.beginTransaction();
        transactionStarted = true;

        const [tickets] = await connection.execute(
          `SELECT
             ticket_id,
             customer_id,
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

        if (String(ticket.customer_id) !== String(customerId)) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(403).send({
            success: false,
            message: 'You cannot close another customer ticket'
          });
        }

        if (ticket.status !== 'Resolved') {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(409).send({
            success: false,
            message: 'Only resolved tickets can be closed'
          });
        }

        await connection.execute(
          `UPDATE tickets
           SET status = 'Closed',
               updated_at = CURRENT_TIMESTAMP
           WHERE ticket_id = ?`,
          [ticketId]
        );

        await connection.execute(
          `INSERT INTO ticket_history (
             ticket_id,
             changed_by_agent_id,
             changed_by_customer_id,
             action_type,
             old_status,
             new_status,
             change_note
           )
           VALUES (?, NULL, ?, 'STATUS_CHANGE', 'Resolved', 'Closed', ?)`,
          [
            ticketId,
            customerId,
            'Ticket closed by customer'
          ]
        );

        // Notify the assigned Agent.
        if (ticket.assigned_agent_id !== null) {
          await createNotification({
            agentId: ticket.assigned_agent_id,
            ticketId,
            type: 'TICKET_CLOSED',
            title: 'Ticket closed by customer',
            message: `Customer closed ticket "${ticket.title}".`,
            connection
          });
        }

        // Notify active Managers.
        await notifyManagers({
          ticketId,
          type: 'TICKET_CLOSED',
          title: 'Ticket closed by customer',
          message: `Customer closed ticket "${ticket.title}".`,
          connection
        });

        await connection.commit();
        transactionStarted = false;

        return reply.code(200).send({
          success: true,
          message: 'Ticket closed successfully',
          ticket: {
            ticket_id: String(ticketId),
            status: 'Closed'
          }
        });

      } catch (error) {
        if (transactionStarted) {
          try {
            await connection.rollback();
          } catch (rollbackError) {
            request.log.error(rollbackError);
          }
        }

        request.log.error(error);

        return reply.code(500).send({
          success: false,
          message: 'Unable to close ticket'
        });

      } finally {
        connection.release();
      }
    }
  );


  // REOPEN A CLOSED TICKET WITHIN 7 DAYS
  fastify.patch(
    '/customer/:ticketId/reopen',
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize('Customer')
      ]
    },
    async (request, reply) => {
      const { ticketId } = request.params;
      const customerId = Number(request.user.customerId);

      if (!isValidId(ticketId)) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid ticket ID'
        });
      }

      if (!Number.isSafeInteger(customerId) || customerId < 1) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid customer account information'
        });
      }

      const connection = await pool.getConnection();
      let transactionStarted = false;

      try {
        await connection.beginTransaction();
        transactionStarted = true;

        // Lock ticket to prevent concurrent status changes.
        const [tickets] = await connection.execute(
          `SELECT
             ticket_id,
             customer_id,
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

        if (String(ticket.customer_id) !== String(customerId)) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(403).send({
            success: false,
            message: 'You cannot reopen another customer ticket'
          });
        }

        if (ticket.status !== 'Closed') {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(409).send({
            success: false,
            message: 'Only closed tickets can be reopened'
          });
        }

        // Find the most recent actual transition to Closed.
        const [closureHistory] = await connection.execute(
          `SELECT changed_at
           FROM ticket_history
           WHERE ticket_id = ?
             AND action_type = 'STATUS_CHANGE'
             AND new_status = 'Closed'
           ORDER BY changed_at DESC, history_id DESC
           LIMIT 1`,
          [ticketId]
        );

        if (closureHistory.length === 0) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(409).send({
            success: false,
            message: 'Ticket closure history is unavailable; contact support'
          });
        }

        // Use the actual closure timestamp, not updated_at.
        const [reopenWindow] = await connection.execute(
          `SELECT
             (
               ? >= DATE_SUB(
                 CURRENT_TIMESTAMP,
                 INTERVAL 7 DAY
               )
             ) AS can_reopen`,
          [closureHistory[0].changed_at]
        );

        if (!reopenWindow[0].can_reopen) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(409).send({
            success: false,
            message: 'Tickets can only be reopened within 7 days of closure'
          });
        }

        // Reopen ticket and clear its previous assignment.
        await connection.execute(
          `UPDATE tickets
           SET status = 'Open',
               assigned_agent_id = NULL,
               resolved_at = NULL,
               updated_at = CURRENT_TIMESTAMP
           WHERE ticket_id = ?`,
          [ticketId]
        );

        // Record status change.
        await connection.execute(
          `INSERT INTO ticket_history (
             ticket_id,
             changed_by_agent_id,
             changed_by_customer_id,
             action_type,
             old_status,
             new_status,
             change_note
           )
           VALUES (?, NULL, ?, 'STATUS_CHANGE', 'Closed', 'Open', ?)`,
          [
            ticketId,
            customerId,
            'Ticket reopened by customer'
          ]
        );

        // Record assignment removal only when an assignment existed.
        if (ticket.assigned_agent_id !== null) {
          await connection.execute(
            `INSERT INTO ticket_history (
               ticket_id,
               changed_by_agent_id,
               changed_by_customer_id,
               action_type,
               old_assigned_agent_id,
               new_assigned_agent_id,
               change_note
             )
             VALUES (?, NULL, ?, 'ASSIGNMENT_CHANGE', ?, NULL, ?)`,
            [
              ticketId,
              customerId,
              ticket.assigned_agent_id,
              'Assignment cleared because customer reopened ticket'
            ]
          );

          // Notify the previous Agent that the assignment was cleared.
          await createNotification({
            agentId: ticket.assigned_agent_id,
            ticketId,
            type: 'TICKET_REOPENED',
            title: 'Ticket reopened by customer',
            message: `Customer reopened ticket "${ticket.title}". Your previous assignment has been cleared.`,
            connection
          });
        }

        // Notify active Managers.
        await notifyManagers({
          ticketId,
          type: 'TICKET_REOPENED',
          title: 'Ticket reopened by customer',
          message: `Customer reopened ticket "${ticket.title}".`,
          connection
        });

        await connection.commit();
        transactionStarted = false;

        return reply.code(200).send({
          success: true,
          message: 'Ticket reopened successfully',
          ticket: {
            ticket_id: String(ticketId),
            status: 'Open',
            assigned_agent_id: null
          }
        });

      } catch (error) {
        if (transactionStarted) {
          try {
            await connection.rollback();
          } catch (rollbackError) {
            request.log.error(rollbackError);
          }
        }

        request.log.error(error);

        return reply.code(500).send({
          success: false,
          message: 'Unable to reopen ticket'
        });

      } finally {
        connection.release();
      }
    }
  );

}

export default customerTicketStatusRoutes;
