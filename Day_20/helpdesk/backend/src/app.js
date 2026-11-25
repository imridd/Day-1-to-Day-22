import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import multipart from '@fastify/multipart';
import { ZodError } from 'zod';
import { env } from './config/env.js';
import { registerAuth } from './plugins/auth.js';
import authRoutes from './routes/auth.routes.js';
import issueRoutes from './routes/issues.routes.js';
import ticketRoutes from './routes/tickets.routes.js';
import attachmentRoutes from './routes/attachments.routes.js';
import agentRoutes from './routes/agents.routes.js';
import statsRoutes from './routes/stats.routes.js';
import chatRoutes from './routes/chat.routes.js';

export async function buildApp() {
  const app = Fastify({ logger: true, bodyLimit: 1024 * 1024 });

  await app.register(cors, {
    origin: env.clientUrl,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });
  await app.register(rateLimit, { max: 200, timeWindow: '1 minute' });
  await app.register(multipart, { limits: { fileSize: 5 * 1024 * 1024, files: 1 } });
  await registerAuth(app);

  app.setErrorHandler((err, req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({
        message: err.issues[0]?.message || 'Validation failed',
        errors: err.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
      });
    }
    if (err.code === 'ER_DUP_ENTRY') return reply.code(409).send({ message: 'Record already exists' });
    if (err.statusCode && err.statusCode < 500) return reply.code(err.statusCode).send({ message: err.message });
    req.log.error(err);
    return reply.code(500).send({ message: 'Internal server error' });
  });

  app.get('/api/health', async () => ({ ok: true }));
  await app.register(authRoutes, { prefix: '/api/auth' });
  await app.register(issueRoutes, { prefix: '/api/issues' });
  await app.register(ticketRoutes, { prefix: '/api/tickets' });
  await app.register(attachmentRoutes, { prefix: '/api/attachments' });
  await app.register(agentRoutes, { prefix: '/api/agents' });
  await app.register(statsRoutes, { prefix: '/api/stats' });
  await app.register(chatRoutes, { prefix: '/api/chat' });

  return app;
}
