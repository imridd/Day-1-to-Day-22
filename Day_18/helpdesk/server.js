
import dotenv from 'dotenv';
dotenv.config();

import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import multipart from '@fastify/multipart';

import pool from './config/database.js';

import corsPlugin from './plugins/cors.js';
import jwtPlugin from './plugins/jwt.js';

import authRoutes from './routes/authRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import agentRoutes from './routes/agentRoutes.js';
import customerRoutes from './routes/customerRoutes.js';

import ticketRoutes from './routes/ticketRoutes.js';
import ticketClaimRoutes from './routes/ticketClaimRoutes.js';
import ticketHistoryRoutes from './routes/ticketHistoryRoutes.js';
import ticketMessageRoutes from './routes/ticketMessageRoutes.js';
import ticketParticipantRoutes from './routes/ticketParticipantRoutes.js';
import ticketPrivateMessageRoutes from './routes/ticketPrivateMessageRoutes.js';

import customerTicketRoutes from './routes/customerTicketRoutes.js';
import customerTicketStatusRoutes from './routes/customerTicketStatusRoutes.js';
import ticketAttachmentRoutes from './routes/ticketAttachmentRoutes.js';

import notificationRoutes from './routes/notificationRoutes.js';

import websocketRoutes from './routes/webSocketRoutes.js';
import notificationWebsocketRoutes from './routes/notificationWebsocketRoutes.js';

const PORT = Number(process.env.PORT || 3000);

if (
  !Number.isInteger(PORT) ||
  PORT < 1 ||
  PORT > 65535
) {
  throw new Error('PORT must be a valid port number');
}

const fastify = Fastify({
  logger: true,
  bodyLimit: 6 * 1024 * 1024
});

// ROOT-LEVEL PLUGINS
// Call the CORS wrapper directly so its registration
// applies to the application routes.
await corsPlugin(fastify);

// JWT decorators are also added at the root level.
await jwtPlugin(fastify);

// WEBSOCKET
await fastify.register(websocket);

// MULTIPART
await fastify.register(multipart, {
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

// HEALTH CHECK
fastify.get('/health', async (request, reply) => {
  try {
    const [rows] = await pool.query(
      'SELECT DATABASE() AS database_name'
    );

    return {
      success: true,
      message: 'Fastify and MySQL connected successfully',
      database: rows[0].database_name
    };

  } catch (error) {
    request.log.error(error);

    return reply.code(503).send({
      success: false,
      message: 'Database connection unavailable'
    });
  }
});

// AUTHENTICATION
await fastify.register(authRoutes, {
  prefix: '/api/auth'
});

// DEPARTMENTS
await fastify.register(departmentRoutes, {
  prefix: '/api/departments'
});

// AGENTS
await fastify.register(agentRoutes, {
  prefix: '/api/agents'
});

// CUSTOMERS
await fastify.register(customerRoutes, {
  prefix: '/api/customers'
});

// TICKETS
await fastify.register(ticketRoutes, {
  prefix: '/api/tickets'
});

await fastify.register(ticketClaimRoutes, {
  prefix: '/api/tickets'
});

await fastify.register(ticketHistoryRoutes, {
  prefix: '/api/tickets'
});

await fastify.register(ticketMessageRoutes, {
  prefix: '/api/tickets'
});

// CUSTOMER TICKET OPERATIONS
await fastify.register(customerTicketRoutes, {
  prefix: '/api/tickets'
});

await fastify.register(customerTicketStatusRoutes, {
  prefix: '/api/tickets'
});

// TICKET CHAT
await fastify.register(ticketParticipantRoutes, {
  prefix: '/api/tickets'
});

await fastify.register(ticketPrivateMessageRoutes, {
  prefix: '/api/tickets'
});

// ATTACHMENTS
await fastify.register(ticketAttachmentRoutes, {
  prefix: '/api/tickets'
});

// NOTIFICATIONS
await fastify.register(notificationRoutes, {
  prefix: '/api/notifications'
});

// MAIN WEBSOCKET
await fastify.register(websocketRoutes);

// NOTIFICATION WEBSOCKET
await fastify.register(notificationWebsocketRoutes);

// GRACEFUL SHUTDOWN
let shuttingDown = false;

const shutdown = async signal => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  fastify.log.info(
    `Received ${signal}. Shutting down...`
  );

  try {
    await fastify.close();
    await pool.end();

    fastify.log.info('Server and database pool closed');

    process.exit(0);

  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

process.once('SIGINT', () => shutdown('SIGINT'));
process.once('SIGTERM', () => shutdown('SIGTERM'));

// START SERVER
try {
  // Verify MySQL connectivity before listening.
  await pool.query('SELECT 1');

  await fastify.listen({
    port: PORT,
    host: '127.0.0.1'
  });

  fastify.log.info(
    `Backend running on port ${PORT}`
  );

  fastify.log.info(
    `Health: http://127.0.0.1:${PORT}/health`
  );

  fastify.log.info(
    `Main WebSocket: ws://127.0.0.1:${PORT}/ws`
  );

  fastify.log.info(
    `Notification WebSocket: ws://127.0.0.1:${PORT}/ws/notifications`
  );

} catch (error) {
  fastify.log.error(error);

  try {
    await fastify.close();
  } catch (closeError) {
    fastify.log.error(closeError);
  }

  try {
    await pool.end();
  } catch (poolError) {
    fastify.log.error(poolError);
  }

  process.exit(1);
}
