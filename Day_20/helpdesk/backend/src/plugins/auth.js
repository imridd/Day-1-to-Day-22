import jwt from '@fastify/jwt';
import { env } from '../config/env.js';
import { query } from '../config/db.js';

const SESSION_LEASE_MINUTES = 3;

export async function registerAuth(app) {
  await app.register(jwt, {
    secret: env.jwtSecret,
    sign: { expiresIn: env.jwtExpiresIn },
  });

  // A valid JWT is not enough: its session must still be the user's active DB session.
  app.decorate('authenticate', async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ message: 'Session expired. Please sign in again.' });
    }

    const userId = req.user?.id;
    const sessionId = req.user?.sid;
    if (!userId || !sessionId) {
      return reply.code(401).send({ message: 'Invalid login session. Please sign in again.' });
    }

    // Renew the short lease on every authenticated request.
    const renewed = await query(
      `UPDATE active_sessions
       SET last_activity = UTC_TIMESTAMP(),
           expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${SESSION_LEASE_MINUTES} MINUTE)
       WHERE user_id = ? AND session_id = ? AND expires_at > UTC_TIMESTAMP()`,
      [userId, sessionId]
    );

    if (renewed.affectedRows !== 1) {
      return reply.code(401).send({ message: 'This login session is no longer active. Please sign in again.' });
    }

    const rows = await query(
      'SELECT id, name, email, role, status FROM users WHERE id = ?',
      [userId]
    );
    const user = rows[0];
    if (!user || user.status !== 'ACTIVE') {
      await query('DELETE FROM active_sessions WHERE user_id = ? AND session_id = ?', [userId, sessionId]);
      return reply.code(401).send({ message: 'Account unavailable' });
    }

    req.currentUser = user;
  });

  app.decorate('authorize', (...roles) => async (req, reply) => {
    if (!roles.includes(req.currentUser.role)) {
      return reply.code(403).send({ message: 'Forbidden' });
    }
  });
}
