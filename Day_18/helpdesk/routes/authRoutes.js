
import pool from '../config/database.js';
import { verifyPassword } from '../utils/password.js';

async function authRoutes(fastify) {

  // LOGIN
  fastify.post('/login', {
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          email: {
            type: 'string',
            minLength: 5,
            maxLength: 190,
            format: 'email'
          },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 128
          }
        }
      }
    }
  }, async (request, reply) => {

    const email = request.body.email.trim().toLowerCase();
    const password = request.body.password;

    // Search both account tables
    const [agents, customers] = await Promise.all([

      pool.execute(
        `SELECT agent_id, full_name, email, role,
                department_id, is_active,
                password_hash, password_salt
         FROM agents
         WHERE email = ?`,
        [email]
      ),

      pool.execute(
        `SELECT customer_id, full_name, email,
                password_hash, password_salt
         FROM customers
         WHERE email = ?`,
        [email]
      )

    ]);

    const agent = agents[0][0];
    const customer = customers[0][0];

    // Reject ambiguous accounts
    if (agent && customer) {
      return reply.code(401).send({
        success: false,
        message: 'Invalid email or password'
      });
    }

    let user;

    if (agent) {

      if (!agent.is_active) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid email or password'
        });
      }

      const validPassword = await verifyPassword(
        password,
        agent.password_hash,
        agent.password_salt
      );

      if (!validPassword) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid email or password'
        });
      }

      user = {
        sub: String(agent.agent_id),
        agentId: agent.agent_id,
        departmentId: agent.department_id,
        name: agent.full_name,
        email: agent.email,
        role: agent.role
      };

    } else if (customer) {

      const validPassword = await verifyPassword(
        password,
        customer.password_hash,
        customer.password_salt
      );

      if (!validPassword) {
        return reply.code(401).send({
          success: false,
          message: 'Invalid email or password'
        });
      }

      user = {
        sub: String(customer.customer_id),
        customerId: customer.customer_id,
        name: customer.full_name,
        email: customer.email,
        role: 'Customer'
      };

    } else {
      return reply.code(401).send({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = fastify.jwt.sign(user);

    return reply.send({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.sub,
        name: user.name,
        email: user.email,
        role: user.role,
        departmentId: user.departmentId ?? null
      }
    });
  });

  // CURRENT LOGGED-IN USER
  fastify.get('/me', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {

    return reply.send({
      success: true,
      user: {
        id: request.user.sub,
        name: request.user.name,
        email: request.user.email,
        role: request.user.role,
        departmentId: request.user.departmentId ?? null
      }
    });

  });

  // LOGOUT
  fastify.post('/logout', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    return reply.send({
      success: true,
      message: 'Logout successful. Please clear your authentication token.'
    });
  });

}

export default authRoutes;
