import bcrypt from 'bcrypt';
import { query } from '../config/db.js';
import { httpError, idParam } from '../utils/errors.js';
import { agentCreateSchema, agentUpdateSchema, agentStatusSchema } from '../schemas/index.js';

export default async function agentRoutes(app) {
  const pre = [app.authenticate, app.authorize('MANAGER')];

  // Agents with workload
  app.get('/', { preHandler: pre }, async () => {
    const rows = await query(
      `SELECT u.id, u.name, u.email, u.status, u.created_at,
              COUNT(t.ticket_id) AS total,
              COALESCE(SUM(t.status = 'OPEN'), 0) AS open_tickets,
              COALESCE(SUM(t.status = 'IN_PROGRESS'), 0) AS in_progress,
              COALESCE(SUM(t.status = 'RESOLVED'), 0) AS resolved,
              COALESCE(SUM(t.status = 'CLOSED'), 0) AS closed
       FROM users u LEFT JOIN tickets t ON t.assigned_agent_id = u.id
       WHERE u.role = 'AGENT' GROUP BY u.id ORDER BY u.id DESC`
    );
    return rows.map((r) => ({
      ...r,
      total: Number(r.total),
      open_tickets: Number(r.open_tickets),
      in_progress: Number(r.in_progress),
      resolved: Number(r.resolved),
      closed: Number(r.closed),
      active_workload: Number(r.open_tickets) + Number(r.in_progress),
    }));
  });

  app.post('/', { preHandler: pre }, async (req, reply) => {
    const d = agentCreateSchema.parse(req.body);
    const hash = await bcrypt.hash(d.password, 12);
    try {
      const rows = await query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'AGENT')",
        [d.name, d.email, hash]
      );
      return reply.code(201).send({ id: rows.insertId });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') throw httpError(409, 'This email is already registered');
      throw err;
    }
  });

  app.put('/:id', { preHandler: pre }, async (req) => {
    const id = idParam(req.params.id);
    const d = agentUpdateSchema.parse(req.body);
    const exists = await query("SELECT id FROM users WHERE id = ? AND role = 'AGENT'", [id]);
    if (!exists[0]) throw httpError(404, 'Agent not found');
    try {
      if (d.password) {
        const hash = await bcrypt.hash(d.password, 12);
        await query('UPDATE users SET name = ?, email = ?, password = ? WHERE id = ?', [d.name, d.email, hash, id]);
      } else {
        await query('UPDATE users SET name = ?, email = ? WHERE id = ?', [d.name, d.email, id]);
      }
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') throw httpError(409, 'This email is already registered');
      throw err;
    }
    return { message: 'Agent updated' };
  });

  // Enable / disable. A disabled agent cannot log in; existing tokens stop working immediately.
  app.patch('/:id/status', { preHandler: pre }, async (req) => {
    const id = idParam(req.params.id);
    const { status } = agentStatusSchema.parse(req.body);
    const rows = await query("SELECT id FROM users WHERE id = ? AND role = 'AGENT'", [id]);
    if (!rows[0]) throw httpError(404, 'Agent not found');
    await query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    return { message: status === 'ACTIVE' ? 'Agent enabled' : 'Agent disabled' };
  });
}
