
import pool from '../config/database.js';

import {
  createNotification
} from '../utils/notificationService.js';

const VALID_STATUSES = [
  'Open',
  'In Progress',
  'Resolved',
  'Closed'
];

const VALID_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

const isValidId = value =>
  /^[1-9]\d*$/.test(String(value));

const sameId = (a, b) =>
  (a == null && b == null) ||
  (a != null && b != null && String(a) === String(b));

async function verifyStaff(connection, user) {
  if (!['Manager', 'Agent'].includes(user.role)) {
    return false;
  }

  const agentId = Number(user.agentId);

  if (!Number.isSafeInteger(agentId) || agentId <= 0) {
    return false;
  }

  const [rows] = await connection.execute(
    `SELECT agent_id
     FROM agents
     WHERE agent_id = ?
       AND role = ?
       AND is_active = TRUE
     LIMIT 1`,
    [agentId, user.role]
  );

  return rows.length > 0;
}

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

async function ticketRoutes(fastify) {

  // GET TICKETS
  fastify.get(
    '/',
    {
      preHandler: [fastify.authenticate]
    },
    async (request, reply) => {
      const user = request.user;

      if (user.role === 'Agent' || user.role === 'Manager') {
        const isActive = await verifyStaff(pool, user);

        if (!isActive) {
          return reply.code(403).send({
            success: false,
            message: 'Your staff account is inactive or invalid'
          });
        }
      }

      if (!['Manager', 'Agent', 'Customer'].includes(user.role)) {
        return reply.code(403).send({
          success: false,
          message: 'Access denied'
        });
      }

      let sql = `
        SELECT
          t.ticket_id,
          t.customer_id,
          c.full_name AS customer_name,
          c.email AS customer_email,
          t.department_id,
          d.department_name,
          t.assigned_agent_id,
          a.full_name AS assigned_agent_name,
          t.title,
          t.description,
          t.priority,
          t.status,
          t.created_at,
          t.updated_at,
          t.resolved_at
        FROM tickets t
        INNER JOIN customers c
          ON t.customer_id = c.customer_id
        INNER JOIN departments d
          ON t.department_id = d.department_id
        LEFT JOIN agents a
          ON t.assigned_agent_id = a.agent_id
      `;

      const params = [];

      if (user.role === 'Agent') {
        sql += `
          WHERE (
            t.assigned_agent_id = ?
            OR (
              t.assigned_agent_id IS NULL
              AND t.department_id = ?
              AND t.status = 'Open'
            )
          )
        `;

        params.push(user.agentId, user.departmentId);

      } else if (user.role === 'Customer') {
        sql += ` WHERE t.customer_id = ?`;
        params.push(user.customerId);
      }

      sql += `
        ORDER BY
          FIELD(t.priority, 'Critical', 'High', 'Medium', 'Low'),
          t.created_at DESC
      `;

      const [tickets] = await pool.execute(sql, params);

      return {
        success: true,
        count: tickets.length,
        tickets
      };
    }
  );


  // GET TICKET BY ID
  fastify.get(
    '/:ticketId',
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

      if (user.role === 'Agent' || user.role === 'Manager') {
        const isActive = await verifyStaff(pool, user);

        if (!isActive) {
          return reply.code(403).send({
            success: false,
            message: 'Your staff account is inactive or invalid'
          });
        }
      }

      if (!['Manager', 'Agent', 'Customer'].includes(user.role)) {
        return reply.code(403).send({
          success: false,
          message: 'Access denied'
        });
      }

      const [tickets] = await pool.execute(
        `SELECT
           t.ticket_id,
           t.customer_id,
           c.full_name AS customer_name,
           c.email AS customer_email,
           t.department_id,
           d.department_name,
           t.assigned_agent_id,
           a.full_name AS assigned_agent_name,
           t.title,
           t.description,
           t.priority,
           t.status,
           t.created_at,
           t.updated_at,
           t.resolved_at
         FROM tickets t
         INNER JOIN customers c
           ON t.customer_id = c.customer_id
         INNER JOIN departments d
           ON t.department_id = d.department_id
         LEFT JOIN agents a
           ON t.assigned_agent_id = a.agent_id
         WHERE t.ticket_id = ?`,
        [ticketId]
      );

      if (tickets.length === 0) {
        return reply.code(404).send({
          success: false,
          message: 'Ticket not found'
        });
      }

      const ticket = tickets[0];

      let allowed = user.role === 'Manager';

      if (user.role === 'Agent') {
        allowed =
          sameId(ticket.assigned_agent_id, user.agentId) ||
          (
            ticket.assigned_agent_id === null &&
            Number(ticket.department_id) === Number(user.departmentId) &&
            ticket.status === 'Open'
          );
      }

      if (user.role === 'Customer') {
        allowed = sameId(ticket.customer_id, user.customerId);
      }

      if (!allowed) {
        return reply.code(403).send({
          success: false,
          message: 'You cannot access this ticket'
        });
      }

      return {
        success: true,
        ticket
      };
    }
  );


  // CREATE TICKET - MANAGER ONLY
  fastify.post(
    '/',
    {
      preHandler: [
        fastify.authenticate,
        fastify.authorize('Manager')
      ],
      schema: {
        body: {
          type: 'object',
          required: [
            'customer_id',
            'department_id',
            'title',
            'description'
          ],
          additionalProperties: false,
          properties: {
            customer_id: {
              type: 'integer',
              minimum: 1
            },
            department_id: {
              type: 'integer',
              minimum: 1
            },
            assigned_agent_id: {
              anyOf: [
                { type: 'integer', minimum: 1 },
                { type: 'null' }
              ]
            },
            title: {
              type: 'string',
              minLength: 1,
              maxLength: 200
            },
            description: {
              type: 'string',
              minLength: 1
            },
            priority: {
              type: 'string',
              enum: VALID_PRIORITIES
            }
          }
        }
      }
    },
    async (request, reply) => {
      const isActive = await verifyStaff(pool, request.user);

      if (!isActive) {
        return reply.code(403).send({
          success: false,
          message: 'Your Manager account is inactive or invalid'
        });
      }

      const {
        customer_id,
        department_id,
        assigned_agent_id = null,
        title,
        description,
        priority = 'Medium'
      } = request.body;

      if (!title.trim() || !description.trim()) {
        return reply.code(400).send({
          success: false,
          message: 'Ticket title and description cannot be empty'
        });
      }

      const connection = await pool.getConnection();
      let transactionStarted = false;

      try {
        await connection.beginTransaction();
        transactionStarted = true;

        const [customers] = await connection.execute(
          `SELECT customer_id
           FROM customers
           WHERE customer_id = ?
           FOR UPDATE`,
          [customer_id]
        );

        if (customers.length === 0) {
          const response = await rollbackAndReply(
            connection,
            reply,
            404,
            'Customer not found'
          );

          transactionStarted = false;
          return response;
        }

        const [departments] = await connection.execute(
          `SELECT department_id
           FROM departments
           WHERE department_id = ?`,
          [department_id]
        );

        if (departments.length === 0) {
          const response = await rollbackAndReply(
            connection,
            reply,
            404,
            'Department not found'
          );

          transactionStarted = false;
          return response;
        }

        if (assigned_agent_id !== null) {
          const [agents] = await connection.execute(
            `SELECT agent_id
             FROM agents
             WHERE agent_id = ?
               AND department_id = ?
               AND role = 'Agent'
               AND is_active = TRUE
             FOR UPDATE`,
            [assigned_agent_id, department_id]
          );

          if (agents.length === 0) {
            const response = await rollbackAndReply(
              connection,
              reply,
              400,
              'Selected Agent is inactive, invalid, or belongs to another department'
            );

            transactionStarted = false;
            return response;
          }
        }

        const [result] = await connection.execute(
          `INSERT INTO tickets (
             customer_id,
             department_id,
             assigned_agent_id,
             title,
             description,
             priority,
             status
           )
           VALUES (?, ?, ?, ?, ?, ?, 'Open')`,
          [
            customer_id,
            department_id,
            assigned_agent_id,
            title.trim(),
            description.trim(),
            priority
          ]
        );

        const ticketId = String(result.insertId);

        await connection.execute(
          `INSERT INTO ticket_history (
             ticket_id,
             changed_by_agent_id,
             action_type,
             new_status,
             new_assigned_agent_id,
             new_department_id,
             change_note
           )
           VALUES (?, ?, 'CREATED', 'Open', ?, ?, ?)`,
          [
            ticketId,
            request.user.agentId,
            assigned_agent_id,
            department_id,
            'Ticket created'
          ]
        );

        // Notify Customer about ticket creation.
        await createNotification({
          customerId: customer_id,
          ticketId,
          type: 'TICKET_CREATED',
          title: 'New support ticket created',
          message: `Your ticket "${title.trim()}" has been created.`,
          connection
        });

        // Notify Agent if the ticket was created with an assignment.
        if (assigned_agent_id !== null) {
          await createNotification({
            agentId: assigned_agent_id,
            ticketId,
            type: 'TICKET_ASSIGNED',
            title: 'New ticket assigned',
            message: `Ticket "${title.trim()}" has been assigned to you.`,
            connection
          });
        }

        await connection.commit();
        transactionStarted = false;

        return reply.code(201).send({
          success: true,
          message: 'Ticket created successfully',
          ticket: {
            ticket_id: ticketId,
            customer_id,
            department_id,
            assigned_agent_id,
            title: title.trim(),
            description: description.trim(),
            priority,
            status: 'Open'
          }
        });

      } catch (error) {
        if (transactionStarted) {
          await connection.rollback();
        }

        throw error;

      } finally {
        connection.release();
      }
    }
  );


  // UPDATE TICKET
  fastify.patch(
    '/:ticketId',
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: {
          type: 'object',
          minProperties: 1,
          additionalProperties: false,
          properties: {
            status: {
              type: 'string',
              enum: VALID_STATUSES
            },
            assigned_agent_id: {
              anyOf: [
                { type: 'integer', minimum: 1 },
                { type: 'null' }
              ]
            },
            department_id: {
              type: 'integer',
              minimum: 1
            },
            change_note: {
              type: 'string',
              maxLength: 500
            }
          }
        }
      }
    },
    async (request, reply) => {
      const { ticketId } = request.params;
      const body = request.body;
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
          message: 'Customers cannot update tickets'
        });
      }

      const isManager = user.role === 'Manager';

      if (
        !isManager &&
        (
          body.assigned_agent_id !== undefined ||
          body.department_id !== undefined
        )
      ) {
        return reply.code(403).send({
          success: false,
          message: 'Only Managers can change ticket assignments or departments'
        });
      }

      if (
        !isManager &&
        body.status !== undefined &&
        !['In Progress', 'Resolved'].includes(body.status)
      ) {
        return reply.code(403).send({
          success: false,
          message: 'Agents can only move assigned tickets to In Progress or Resolved'
        });
      }

      const connection = await pool.getConnection();
      let transactionStarted = false;

      try {
        await connection.beginTransaction();
        transactionStarted = true;

        const [rows] = await connection.execute(
          `SELECT
             ticket_id,
             customer_id,
             title,
             department_id,
             assigned_agent_id,
             status
           FROM tickets
           WHERE ticket_id = ?
           FOR UPDATE`,
          [ticketId]
        );

        if (rows.length === 0) {
          const response = await rollbackAndReply(
            connection,
            reply,
            404,
            'Ticket not found'
          );

          transactionStarted = false;
          return response;
        }

        const oldTicket = rows[0];

        const [staff] = await connection.execute(
          `SELECT agent_id, department_id, role, is_active
           FROM agents
           WHERE agent_id = ?
           FOR UPDATE`,
          [user.agentId]
        );

        if (
          staff.length === 0 ||
          staff[0].role !== user.role ||
          !staff[0].is_active
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

        if (
          !isManager &&
          !sameId(oldTicket.assigned_agent_id, user.agentId)
        ) {
          const response = await rollbackAndReply(
            connection,
            reply,
            403,
            'You can only update tickets assigned to you'
          );

          transactionStarted = false;
          return response;
        }

        const newDepartmentId =
          body.department_id !== undefined
            ? body.department_id
            : oldTicket.department_id;

        const newAssignedAgentId =
          body.assigned_agent_id !== undefined
            ? body.assigned_agent_id
            : oldTicket.assigned_agent_id;

        const newStatus =
          body.status !== undefined
            ? body.status
            : oldTicket.status;

        const departmentChanged =
          Number(newDepartmentId) !== Number(oldTicket.department_id);

        const assignmentChanged =
          !sameId(newAssignedAgentId, oldTicket.assigned_agent_id);

        const statusChanged =
          newStatus !== oldTicket.status;

        if (
          departmentChanged &&
          body.assigned_agent_id === undefined &&
          oldTicket.assigned_agent_id !== null
        ) {
          const response = await rollbackAndReply(
            connection,
            reply,
            400,
            'Provide a new Agent or explicitly set assigned_agent_id to null when changing departments'
          );

          transactionStarted = false;
          return response;
        }

        if (departmentChanged) {
          const [departments] = await connection.execute(
            `SELECT department_id
             FROM departments
             WHERE department_id = ?`,
            [newDepartmentId]
          );

          if (departments.length === 0) {
            const response = await rollbackAndReply(
              connection,
              reply,
              404,
              'Department not found'
            );

            transactionStarted = false;
            return response;
          }
        }

        if (
          newAssignedAgentId !== null &&
          (assignmentChanged || departmentChanged)
        ) {
          const [agents] = await connection.execute(
            `SELECT agent_id
             FROM agents
             WHERE agent_id = ?
               AND department_id = ?
               AND role = 'Agent'
               AND is_active = TRUE
             FOR UPDATE`,
            [newAssignedAgentId, newDepartmentId]
          );

          if (agents.length === 0) {
            const response = await rollbackAndReply(
              connection,
              reply,
              400,
              'Assigned Agent must be active and belong to the ticket department'
            );

            transactionStarted = false;
            return response;
          }
        }

        if (
          !isManager &&
          !['Open', 'In Progress'].includes(oldTicket.status)
        ) {
          const response = await rollbackAndReply(
            connection,
            reply,
            400,
            'This ticket cannot be updated by the Agent in its current status'
          );

          transactionStarted = false;
          return response;
        }

        await connection.execute(
          `UPDATE tickets
           SET
             department_id = ?,
             assigned_agent_id = ?,
             status = ?,
             updated_at = CURRENT_TIMESTAMP,
             resolved_at = CASE
               WHEN ? = 'Resolved'
                 THEN COALESCE(resolved_at, CURRENT_TIMESTAMP)
               WHEN ? IN ('Open', 'In Progress')
                 THEN NULL
               ELSE resolved_at
             END
           WHERE ticket_id = ?`,
          [
            newDepartmentId,
            newAssignedAgentId,
            newStatus,
            newStatus,
            newStatus,
            ticketId
          ]
        );

        const actorId = user.agentId;
        const changeNote =
          body.change_note?.trim() || 'Ticket updated';

        // STATUS HISTORY
        if (statusChanged) {
          await connection.execute(
            `INSERT INTO ticket_history (
               ticket_id,
               changed_by_agent_id,
               action_type,
               old_status,
               new_status,
               change_note
             )
             VALUES (?, ?, 'STATUS_CHANGE', ?, ?, ?)`,
            [
              ticketId,
              actorId,
              oldTicket.status,
              newStatus,
              changeNote
            ]
          );

          // Notify Customer about status change.
          await createNotification({
            customerId: oldTicket.customer_id,
            ticketId,
            type: 'TICKET_STATUS_CHANGED',
            title: 'Ticket status updated',
            message: `Your ticket "${oldTicket.title}" is now ${newStatus}.`,
            connection
          });
        }

        // ASSIGNMENT HISTORY AND NOTIFICATIONS
        if (assignmentChanged) {
          await connection.execute(
            `INSERT INTO ticket_history (
               ticket_id,
               changed_by_agent_id,
               action_type,
               old_assigned_agent_id,
               new_assigned_agent_id,
               change_note
             )
             VALUES (?, ?, 'ASSIGNMENT_CHANGE', ?, ?, ?)`,
            [
              ticketId,
              actorId,
              oldTicket.assigned_agent_id,
              newAssignedAgentId,
              changeNote
            ]
          );

          if (newAssignedAgentId !== null) {
            await createNotification({
              agentId: newAssignedAgentId,
              ticketId,
              type: 'TICKET_ASSIGNED',
              title: 'Ticket assigned to you',
              message: `Ticket "${oldTicket.title}" has been assigned to you.`,
              connection
            });
          }

          if (oldTicket.assigned_agent_id !== null) {
            await createNotification({
              agentId: oldTicket.assigned_agent_id,
              ticketId,
              type: 'TICKET_REASSIGNED',
              title: 'Ticket assignment changed',
              message: `Ticket "${oldTicket.title}" is no longer assigned to you.`,
              connection
            });
          }

          if (newAssignedAgentId !== null) {
            await createNotification({
              customerId: oldTicket.customer_id,
              ticketId,
              type: 'TICKET_ASSIGNED',
              title: 'Agent assigned to your ticket',
              message: `An Agent has been assigned to your ticket "${oldTicket.title}".`,
              connection
            });
          }
        }

        // DEPARTMENT HISTORY
        if (departmentChanged) {
          await connection.execute(
            `INSERT INTO ticket_history (
               ticket_id,
               changed_by_agent_id,
               action_type,
               old_department_id,
               new_department_id,
               change_note
             )
             VALUES (?, ?, 'DEPARTMENT_CHANGE', ?, ?, ?)`,
            [
              ticketId,
              actorId,
              oldTicket.department_id,
              newDepartmentId,
              changeNote
            ]
          );
        }

        await connection.commit();
        transactionStarted = false;

        return reply.code(200).send({
          success: true,
          message: 'Ticket updated successfully',
          ticket: {
            ticket_id: String(ticketId),
            department_id: newDepartmentId,
            assigned_agent_id: newAssignedAgentId,
            status: newStatus
          }
        });

      } catch (error) {
        if (transactionStarted) {
          await connection.rollback();
        }

        throw error;

      } finally {
        connection.release();
      }
    }
  );

}

export default ticketRoutes;
