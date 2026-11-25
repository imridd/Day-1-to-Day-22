
import pool from '../config/database.js';
import { notifyManagers } from '../utils/notificationService.js';

const isValidId = value =>
  (typeof value === 'number' && Number.isSafeInteger(value) && value > 0) ||
  (typeof value === 'string' && /^[1-9]\d*$/.test(value));

async function customerTicketRoutes(fastify) {

  fastify.post(
    '/customer',
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize('Customer')
      ]
    },
    async (request, reply) => {

      const customerId = Number(request.user.customerId);
      const body = request.body;

      if (!Number.isSafeInteger(customerId) || customerId <= 0) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid customer account information'
        });
      }

      if (
        !body ||
        typeof body !== 'object' ||
        Array.isArray(body)
      ) {
        return reply.code(400).send({
          success: false,
          message: 'A valid request body is required'
        });
      }

      const allowedFields = [
        'title',
        'description',
        'department_id',
        'priority'
      ];

      const unexpectedFields = Object.keys(body).filter(
        key => !allowedFields.includes(key)
      );

      if (unexpectedFields.length > 0) {
        return reply.code(400).send({
          success: false,
          message: 'Unexpected fields are not allowed',
          fields: unexpectedFields
        });
      }

      const {
        title,
        description,
        department_id,
        priority = 'Medium'
      } = body;

      if (
        typeof title !== 'string' ||
        !title.trim() ||
        title.trim().length > 200
      ) {
        return reply.code(400).send({
          success: false,
          message: 'Title is required and must not exceed 200 characters'
        });
      }

      if (
        typeof description !== 'string' ||
        !description.trim() ||
        description.trim().length > 10000
      ) {
        return reply.code(400).send({
          success: false,
          message: 'Description is required and must not exceed 10000 characters'
        });
      }

      if (!isValidId(department_id)) {
        return reply.code(400).send({
          success: false,
          message: 'A valid department_id is required'
        });
      }

      const departmentId = Number(department_id);

      if (!Number.isSafeInteger(departmentId)) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid department_id'
        });
      }

      const allowedPriorities = [
        'Low',
        'Medium',
        'High',
        'Critical'
      ];

      if (
        typeof priority !== 'string' ||
        !allowedPriorities.includes(priority)
      ) {
        return reply.code(400).send({
          success: false,
          message: 'Invalid priority'
        });
      }

      const connection = await pool.getConnection();
      let transactionStarted = false;

      try {
        await connection.beginTransaction();
        transactionStarted = true;

        // Verify that the customer account still exists.
        const [customers] = await connection.execute(
          `SELECT customer_id
           FROM customers
           WHERE customer_id = ?
           FOR UPDATE`,
          [customerId]
        );

        if (customers.length === 0) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(401).send({
            success: false,
            message: 'Customer account not found'
          });
        }

        // Verify department exists.
        const [departments] = await connection.execute(
          `SELECT department_id
           FROM departments
           WHERE department_id = ?
           LIMIT 1`,
          [departmentId]
        );

        if (departments.length === 0) {
          await connection.rollback();
          transactionStarted = false;

          return reply.code(404).send({
            success: false,
            message: 'Department not found'
          });
        }

        // Create ticket.
        const [ticketResult] = await connection.execute(
          `INSERT INTO tickets (
             customer_id,
             department_id,
             assigned_agent_id,
             title,
             description,
             priority,
             status
           )
           VALUES (?, ?, NULL, ?, ?, ?, 'Open')`,
          [
            customerId,
            departmentId,
            title.trim(),
            description.trim(),
            priority
          ]
        );

        const ticketId = String(ticketResult.insertId);

        // Record customer as the actual creator.
        await connection.execute(
          `INSERT INTO ticket_history (
             ticket_id,
             changed_by_agent_id,
             changed_by_customer_id,
             action_type,
             new_department_id,
             change_note
           )
           VALUES (?, NULL, ?, 'CREATED', ?, ?)`,
          [
            ticketId,
            customerId,
            departmentId,
            'Ticket created by customer'
          ]
        );

        await connection.commit();
        transactionStarted = false;

        // Notify Managers only after the ticket is committed.
        // Notification failure must not undo ticket creation.
        try {
          await notifyManagers({
            ticketId,
            type: 'TICKET_CREATED',
            title: 'New customer ticket',
            message: `A customer created ticket #${ticketId}: ${title.trim()}`
          });
        } catch (notificationError) {
          request.log.error(
            notificationError,
            'Ticket created, but Manager notification failed'
          );
        }

        return reply.code(201).send({
          success: true,
          message: 'Support ticket created successfully',
          ticket: {
            ticket_id: ticketId,
            customer_id: customerId,
            department_id: departmentId,
            assigned_agent_id: null,
            title: title.trim(),
            description: description.trim(),
            priority,
            status: 'Open'
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
          message: 'Unable to create support ticket'
        });

      } finally {
        connection.release();
      }
    }
  );

}

export default customerTicketRoutes;
