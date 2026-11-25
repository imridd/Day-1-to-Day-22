import bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { query } from '../config/db.js';
import { httpError } from '../utils/errors.js';
import { loginSchema, registerSchema } from '../schemas/index.js';

const strictLimit = { config: { rateLimit: { max: 10, timeWindow: '1 minute' } } };
const SESSION_LEASE_MINUTES = 3;

export default async function authRoutes(app) {
  // Customer self-registration only. Managers are seeded; agents are created by a manager.
  app.post('/register', strictLimit, async (req, reply) => {
    const data = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(data.password, 12);
    try {
      await query(
        'INSERT INTO users (name, email, mobile, password, role) VALUES (?, ?, ?, ?, ?)',
        [data.name, data.email, data.mobile ?? null, hash, 'CUSTOMER']
      );
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') throw httpError(409, 'This email is already registered');
      throw err;
    }
    return reply.code(201).send({ message: 'Account created. You can sign in now.' });
  });

  // Exactly one unexpired session per user, regardless of role, tab or device.
  app.post('/login', strictLimit, async (req) => {
    const { email, password } = loginSchema.parse(req.body);
    const rows = await query(
      'SELECT id, name, email, password, role, status FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];
    const ok = user ? await bcrypt.compare(password, user.password) : false;
    if (!ok) throw httpError(401, 'Incorrect email or password');
    if (user.status !== 'ACTIVE') throw httpError(403, 'This account has been disabled');

    const sessionId = randomUUID();
    try {
      await query(
        `INSERT INTO active_sessions (user_id, session_id, created_at, last_activity, expires_at)
         VALUES (?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP(), DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${SESSION_LEASE_MINUTES} MINUTE))`,
        [user.id, sessionId]
      );
    } catch (err) {
      if (err.code !== 'ER_DUP_ENTRY') throw err;

      // Reclaim only an expired lease. Never replace a live session.
      const reclaimed = await query(
        `UPDATE active_sessions
         SET session_id = ?, created_at = UTC_TIMESTAMP(), last_activity = UTC_TIMESTAMP(),
             expires_at = DATE_ADD(UTC_TIMESTAMP(), INTERVAL ${SESSION_LEASE_MINUTES} MINUTE)
         WHERE user_id = ? AND expires_at <= UTC_TIMESTAMP()`,
        [sessionId, user.id]
      );
      if (reclaimed.affectedRows !== 1) {
        throw httpError(409, 'This account is already logged in on another tab or device. Please sign out there first.');
      }
    }

    const token = app.jwt.sign({ id: user.id, role: user.role, sid: sessionId });
    return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  });

  // Idempotent logout: also works when the session row was already removed.
  // It only deletes the exact session represented by this signed JWT.
  app.post('/logout', async (req) => {
    try {
      await req.jwtVerify();
      if (req.user?.id && req.user?.sid) {
        await query(
          'DELETE FROM active_sessions WHERE user_id = ? AND session_id = ?',
          [req.user.id, req.user.sid]
        );
      }
    } catch {
      // A logout request should remain safe/idempotent if the JWT has expired.
    }
    return { message: 'Logged out' };
  });

  app.post('/heartbeat', { preHandler: [app.authenticate] }, async (req) => ({ ok: true }));
  app.get('/me', { preHandler: [app.authenticate] }, async (req) => req.currentUser);
}
