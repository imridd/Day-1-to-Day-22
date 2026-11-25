
import pool from '../config/database.js';

async function customerRoutes(fastify) {

  // GET ALL CUSTOMERS
  fastify.get('/', {
    preHandler: [
      fastify.authenticate,
      fastify.authorize('Manager')
    ]
  }, async () => {

    const [customers] = await pool.execute(
      `SELECT
          customer_id,
          full_name,
          email,
          phone,
          created_at
       FROM customers
       ORDER BY customer_id DESC`
    );

    return {
      success: true,
      count: customers.length,
      customers
    };
  });

  // GET CUSTOMER BY ID
  fastify.get('/:customerId', {
    preHandler: [
      fastify.authenticate,
      fastify.authorize('Manager')
    ],
    schema: {
      params: {
        type: 'object',
        required: ['customerId'],
        properties: {
          customerId: {
            type: 'integer',
            minimum: 1
          }
        }
      }
    }
  }, async (request, reply) => {

    const [customers] = await pool.execute(
      `SELECT
          customer_id,
          full_name,
          email,
          phone,
          created_at
       FROM customers
       WHERE customer_id = ?`,
      [request.params.customerId]
    );

    if (customers.length === 0) {
      return reply.code(404).send({
        success: false,
        message: 'Customer not found'
      });
    }

    return {
      success: true,
      customer: customers[0]
    };
  });

  // CREATE CUSTOMER
  fastify.post('/', {
    preHandler: [
      fastify.authenticate,
      fastify.authorize('Manager')
    ],
    schema: {
      body: {
        type: 'object',
        required: ['full_name', 'email'],
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
            maxLength: 198
          },
          phone: {
            anyOf: [
              {
                type: 'string',
                maxLength: 20
              },
              {
                type: 'null'
              }
            ]
          }
        }
      }
    }
  }, async (request, reply) => {

    const fullName = request.body.full_name.trim();
    const email = request.body.email.trim().toLowerCase();
    const phone = request.body.phone?.trim() || null;

    if (!fullName) {
      return reply.code(400).send({
        success: false,
        message: 'Customer name cannot be empty'
      });
    }

    try {
      const [result] = await pool.execute(
        `INSERT INTO customers (
            full_name,
            email,
            phone
         )
         VALUES (?, ?, ?)`,
        [fullName, email, phone]
      );

      return reply.code(201).send({
        success: true,
        message: 'Customer created successfully. A password must be provisioned securely before login.',
        customer: {
          customer_id: result.insertId,
          full_name: fullName,
          email,
          phone
        }
      });

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return reply.code(409).send({
          success: false,
          message: 'A customer with this email already exists'
        });
      }

      throw error;
    }
  });

  // UPDATE CUSTOMER
  fastify.patch('/:customerId', {
    preHandler: [
      fastify.authenticate,
      fastify.authorize('Manager')
    ],
    schema: {
      params: {
        type: 'object',
        required: ['customerId'],
        properties: {
          customerId: {
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
            maxLength: 198
          },
          phone: {
            anyOf: [
              {
                type: 'string',
                maxLength: 20
              },
              {
                type: 'null'
              }
            ]
          }
        }
      }
    }
  }, async (request, reply) => {

    const customerId = request.params.customerId;
    const body = request.body;

    const [existing] = await pool.execute(
      `SELECT customer_id
       FROM customers
       WHERE customer_id = ?`,
      [customerId]
    );

    if (existing.length === 0) {
      return reply.code(404).send({
        success: false,
        message: 'Customer not found'
      });
    }

    const updates = [];
    const values = [];

    if (body.full_name !== undefined) {
      const fullName = body.full_name.trim();

      if (!fullName) {
        return reply.code(400).send({
          success: false,
          message: 'Customer name cannot be empty'
        });
      }

      updates.push('full_name = ?');
      values.push(fullName);
    }

    if (body.email !== undefined) {
      updates.push('email = ?');
      values.push(body.email.trim().toLowerCase());
    }

    if (body.phone !== undefined) {
      updates.push('phone = ?');
      values.push(body.phone === null ? null : body.phone.trim() || null);
    }

    values.push(customerId);

    try {
      await pool.execute(
        `UPDATE customers
         SET ${updates.join(', ')}
         WHERE customer_id = ?`,
        values
      );

      return {
        success: true,
        message: 'Customer updated successfully'
      };

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return reply.code(409).send({
          success: false,
          message: 'Another customer already uses this email'
        });
      }

      throw error;
    }
  });
}

export default customerRoutes;
