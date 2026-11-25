
import cors from '@fastify/cors';

async function corsPlugin(fastify) {
  const configuredOrigins = process.env.APP_ORIGIN;

  if (!configuredOrigins) {
    throw new Error('APP_ORIGIN is missing');
  }

  const allowedOrigins = configuredOrigins
    .split(',')
    .map(origin => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    throw new Error('No valid CORS origins configured');
  }

  await fastify.register(cors, {
    origin: allowedOrigins,
    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS'
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization'
    ],
    credentials: true
  });
}

export default corsPlugin;
