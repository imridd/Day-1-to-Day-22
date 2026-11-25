
import pool from '../config/database.js';

async function agentRoutes(fastify) {

  // GET ALL AGENTS
  fastify.get('/', {
    preHandler: [
      fastify.authenticate,
      fastify.authorize('Manager')
    ]
  }, async (request, reply) => {

    const [agents] = await pool.execute(
      `SELECT
          a.agent_id,
          a.full_name,
          a.email,
          a.role,
          a.department_id,
          d.department_name,
          a.is_active,
          a.last_seen_at
       FROM agents a
       INNER JOIN departments d
          ON a.department_id = d.department_id
       ORDER BY a.agent_id`
    );

    return {
      success: true,
      count: agents.length,
      agents
    };
  });

  // CREATE AGENT
  fastify.post('/', {
    preHandler: [
      fastify.authenticate,
      fastify.authorize('Manager')
    ],
    schema: {
      body: {
        type: 'object',
        required: ['full_name', 'email', 'department_id'],
        additionalProperties: false,
        properties: {
          full_name: {
            type: 'string',
            minLength: 2,
            maxLength: 120
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 190
          },
          department_id: {
            type: 'integer',
            minimum: 1
          }
        }
      }
    }
  }, async (request, reply) => {

    const fullName = request.body.full_name.trim();
    const email = request.body.email.trim().toLowerCase();
    const departmentId = request.body.department_id;

    if (!fullName) {
      return reply.code(400).send({
        success: false,
        message: 'Agent name cannot be empty'
      });
    }

    try {
      const [result] = await pool.execute(
        `INSERT INTO agents (
            department_id,
            full_name,
            email,
            role,
            is_active
         )
         VALUES (?, ?, ?, 'Agent', 1)`,
        [departmentId, fullName, email]
      );

      return reply.code(201).send({
        success: true,
        message: 'Agent created successfully. Set their password using the secure provisioning script.',
        agent: {
          agent_id: result.insertId,
          full_name: fullName,
          email,
          department_id: departmentId,
          role: 'Agent',
          is_active: 1
        }
      });

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return reply.code(409).send({
          success: false,
          message: 'An account with this email already exists'
        });
      }

      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return reply.code(400).send({
          success: false,
          message: 'Selected department does not exist'
        });
      }

      throw error;
    }
  });

  // UPDATE AGENT
  fastify.patch('/:agentId', {
    preHandler: [
      fastify.authenticate,
      fastify.authorize('Manager')
    ],
    schema: {
      params: {
        type: 'object',
        required: ['agentId'],
        properties: {
          agentId: {
            type: 'integer',
            minimum: 1
          }
        }
      },
      body: {
        type: 'object',
        minProperties: 1,
        additionalProperties: false,
        properties: {
          full_name: {
            type: 'string',
            minLength: 2,
            maxLength: 120
          },
          email: {
            type: 'string',
            format: 'email',
            maxLength: 190
          },
          department_id: {
            type: 'integer',
            minimum: 1
          },
          is_active: {
            type: 'boolean'
          }
        }
      }
    }
  }, async (request, reply) => {

    const agentId = request.params.agentId;
    const body = request.body;

    const [existing] = await pool.execute(
      `SELECT agent_id, role
       FROM agents
       WHERE agent_id = ?`,
      [agentId]
    );

    if (existing.length === 0) {
      return reply.code(404).send({
        success: false,
        message: 'Agent not found'
      });
    }

    if (
      Number(agentId) === Number(request.user.agentId) &&
      body.is_active === false
    ) {
      return reply.code(400).send({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const updates = [];
    const values = [];

    if (body.full_name !== undefined) {
      const fullName = body.full_name.trim();

      if (!fullName) {
        return reply.code(400).send({
          success: false,
          message: 'Agent name cannot be empty'
        });
      }

      updates.push('full_name = ?');
      values.push(fullName);
    }

    if (body.email !== undefined) {
      updates.push('email = ?');
      values.push(body.email.trim().toLowerCase());
    }

    if (body.department_id !== undefined) {
      updates.push('department_id = ?');
      values.push(body.department_id);
    }

    if (body.is_active !== undefined) {
      updates.push('is_active = ?');
      values.push(body.is_active ? 1 : 0);
    }

    values.push(agentId);

    try {
      const [result] = await pool.execute(
        `UPDATE agents
         SET ${updates.join(', ')}
         WHERE agent_id = ?`,
        values
      );

      return {
        success: true,
        message: result.affectedRows
          ? 'Agent updated successfully'
          : 'No changes were necessary'
      };

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return reply.code(409).send({
          success: false,
          message: 'Another account already uses this email'
        });
      }

      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return reply.code(400).send({
          success: false,
          message: 'Selected department does not exist'
        });
      }

      throw error;
    }
  });
}

export default agentRoutes;
