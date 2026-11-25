
import pool from '../config/database.js';

const isValidId = value =>
  /^[1-9]\d*$/.test(String(value));

async function ticketHistoryRoutes(fastify) {

  fastify.get(
    '/:ticketId/history',
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
          message: 'You do not have permission to view ticket history'
        });
      }

      try {
        // Verify staff account.
        const [agents] = await pool.execute(
          `SELECT agent_id, department_id, role, is_active
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

        const agent = agents[0];

        // Find the ticket.
        const [tickets] = await pool.execute(
          `SELECT
             ticket_id,
             department_id,
             assigned_agent_id,
             status
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

        // Agent access restrictions.
        if (user.role === 'Agent') {

          const isAssignedAgent =
            ticket.assigned_agent_id !== null &&
            String(ticket.assigned_agent_id) === String(agent.agent_id);

          const isAvailableInDepartment =
            ticket.assigned_agent_id === null &&
            ticket.status === 'Open' &&
            Number(ticket.department_id) ===
              Number(agent.department_id);

          if (!isAssignedAgent && !isAvailableInDepartment) {
            return reply.code(403).send({
              success: false,
              message: 'You cannot view this ticket history'
            });
          }
        }

        // Retrieve complete history.
        // LEFT JOIN is essential because a history record
        // can be created by a Customer instead of an Agent.
        const [history] = await pool.execute(
          `SELECT
             h.history_id,
             h.ticket_id,
             h.action_type,

             h.old_status,
             h.new_status,

             h.old_assigned_agent_id,
             oldAgent.full_name AS old_assigned_agent_name,

             h.new_assigned_agent_id,
             newAgent.full_name AS new_assigned_agent_name,

             h.old_department_id,
             oldDepartment.department_name AS old_department_name,

             h.new_department_id,
             newDepartment.department_name AS new_department_name,

             h.changed_by_agent_id,
             h.changed_by_customer_id,

             CASE
               WHEN h.changed_by_customer_id IS NOT NULL
                 THEN 'Customer'
               WHEN h.changed_by_agent_id IS NOT NULL
                 THEN 'Staff'
               ELSE 'System'
             END AS changed_by_type,

             COALESCE(
               actor.full_name,
               customerActor.full_name,
               'System'
             ) AS changed_by_name,

             h.change_note,
             h.changed_at

           FROM ticket_history h

           LEFT JOIN agents actor
             ON actor.agent_id = h.changed_by_agent_id

           LEFT JOIN customers customerActor
             ON customerActor.customer_id = h.changed_by_customer_id

           LEFT JOIN agents oldAgent
             ON oldAgent.agent_id = h.old_assigned_agent_id

           LEFT JOIN agents newAgent
             ON newAgent.agent_id = h.new_assigned_agent_id

           LEFT JOIN departments oldDepartment
             ON oldDepartment.department_id = h.old_department_id

           LEFT JOIN departments newDepartment
             ON newDepartment.department_id = h.new_department_id

           WHERE h.ticket_id = ?

           ORDER BY h.changed_at ASC, h.history_id ASC`,
          [ticketId]
        );

        return reply.code(200).send({
          success: true,
          ticket_id: String(ticketId),
          total: history.length,
          history
        });

      } catch (error) {
        fastify.log.error(error);

        return reply.code(500).send({
          success: false,
          message: 'Unable to retrieve ticket history'
        });
      }
    }
  );

}

export default ticketHistoryRoutes;
