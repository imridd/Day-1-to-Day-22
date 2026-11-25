
import jwt from '@fastify/jwt';

async function jwtPlugin(fastify) {
  const secret = process.env.JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters');
  }

  await fastify.register(jwt, {
    secret,
    sign: {
      expiresIn: '2h',
      iss: 'helpdesk-genz',
      aud: 'helpdesk-browser'
    },
    verify: {
      allowedIss: 'helpdesk-genz',
      allowedAud: 'helpdesk-browser'
    }
  });

  // Verify JWT token
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (error) {
      return reply.code(401).send({
        success: false,
        message: 'Invalid or expired authentication token'
      });
    }
  });

  // Check user role
  fastify.decorate('authorize', function (...allowedRoles) {
    return async function (request, reply) {
      if (!request.user) {
        return reply.code(401).send({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!allowedRoles.includes(request.user.role)) {
        return reply.code(403).send({
          success: false,
          message: 'You do not have permission to access this resource'
        });
      }
    };
  });
}

export default jwtPlugin;

