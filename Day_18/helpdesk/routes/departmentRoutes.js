
import pool from '../config/database.js';

async function departmentRoutes(fastify) {

  // GET ALL DEPARTMENTS
  fastify.get('/', {
    preHandler: [
      fastify.authenticate,
      fastify.authorize('Manager')
    ]
  }, async (request, reply) => {

    const [departments] = await pool.execute(
      `SELECT
          department_id,
          department_name
       FROM departments
       ORDER BY department_id`
    );

    return {
      success: true,
      count: departments.length,
      departments
    };
  });

  // CREATE DEPARTMENT
  fastify.post('/', {
    preHandler: [
      fastify.authenticate,
      fastify.authorize('Manager')
    ],
    schema: {
      body: {
        type: 'object',
        required: ['department_name'],
        additionalProperties: false,
        properties: {
          department_name: {
            type: 'string',
            minLength: 2,
            maxLength: 80
          }
        }
      }
    }
  }, async (request, reply) => {

    const departmentName = request.body.department_name.trim();

    if (!departmentName) {
      return reply.code(400).send({
        success: false,
        message: 'Department name cannot be empty'
      });
    }

    try {
      const [result] = await pool.execute(
        `INSERT INTO departments (department_name)
         VALUES (?)`,
        [departmentName]
      );

      return reply.code(201).send({
        success: true,
        message: 'Department created successfully',
        department: {
          department_id: result.insertId,
          department_name: departmentName
        }
      });

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return reply.code(409).send({
          success: false,
          message: 'Department already exists'
        });
      }

      throw error;
    }
  });

  // UPDATE DEPARTMENT
  fastify.patch('/:departmentId', {
    preHandler: [
      fastify.authenticate,
      fastify.authorize('Manager')
    ],
    schema: {
      params: {
        type: 'object',
        required: ['departmentId'],
        properties: {
          departmentId: {
            type: 'integer',
            minimum: 1
          }
        }
      },
      body: {
        type: 'object',
        required: ['department_name'],
        additionalProperties: false,
        properties: {
          department_name: {
            type: 'string',
            minLength: 2,
            maxLength: 80
          }
        }
      }
    }
  }, async (request, reply) => {

    const departmentId = request.params.departmentId;
    const departmentName = request.body.department_name.trim();

    if (!departmentName) {
      return reply.code(400).send({
        success: false,
        message: 'Department name cannot be empty'
      });
    }

    try {
      const [result] = await pool.execute(
        `UPDATE departments
         SET department_name = ?
         WHERE department_id = ?`,
        [departmentName, departmentId]
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({
          success: false,
          message: 'Department not found'
        });
      }

      return {
        success: true,
        message: 'Department updated successfully'
      };

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return reply.code(409).send({
          success: false,
          message: 'Another department already uses this name'
        });
      }

      throw error;
    }
  });

  // DELETE DEPARTMENT
  fastify.delete('/:departmentId', {
    preHandler: [
      fastify.authenticate,
      fastify.authorize('Manager')
    ],
    schema: {
      params: {
        type: 'object',
        required: ['departmentId'],
        properties: {
          departmentId: {
            type: 'integer',
            minimum: 1
          }
        }
      }
    }
  }, async (request, reply) => {

    const departmentId = request.params.departmentId;

    try {
      const [result] = await pool.execute(
        `DELETE FROM departments
         WHERE department_id = ?`,
        [departmentId]
      );

      if (result.affectedRows === 0) {
        return reply.code(404).send({
          success: false,
          message: 'Department not found'
        });
      }

      return {
        success: true,
        message: 'Department deleted successfully'
      };

    } catch (error) {
      if (error.code === 'ER_ROW_IS_REFERENCED_2') {
        return reply.code(409).send({
          success: false,
          message: 'Cannot delete this department because agents or tickets are using it'
        });
      }

      throw error;
    }
  });
}

export default departmentRoutes;
