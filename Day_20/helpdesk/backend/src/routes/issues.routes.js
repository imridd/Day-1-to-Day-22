import { query, withTx, pool } from '../config/db.js';
import { httpError, idParam } from '../utils/errors.js';
import { issueSchema, createTicketSchema } from '../schemas/index.js';
import { logHistory } from '../utils/history.js';

export default async function issueRoutes(app) {
  const auth = [app.authenticate];

  // Customer raises an issue
  app.post('/', { preHandler: [...auth, app.authorize('CUSTOMER')] }, async (req, reply) => {
    const d = issueSchema.parse(req.body);
    const [res] = await pool.execute(
      `INSERT INTO customer_issues (customer_id, name, email, mobile, subject, category, description)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.currentUser.id, d.name, d.email, d.mobile, d.subject, d.category, d.description]
    );
    return reply.code(201).send({ id: res.insertId, message: 'Issue submitted. A manager will review it shortly.' });
  });

  // Manager: all issues (?status=NEW). Customer: own issues.
  app.get('/', { preHandler: auth }, async (req) => {
    const u = req.currentUser;
    if (u.role === 'MANAGER') {
      const status = req.query.status === 'NEW' || req.query.status === 'TICKET_CREATED' ? req.query.status : null;
      return query(
        `SELECT i.*, t.ticket_id FROM customer_issues i
         LEFT JOIN tickets t ON t.issue_id = i.id
         ${status ? 'WHERE i.status = ?' : ''}
         ORDER BY i.id DESC LIMIT 500`,
        status ? [status] : []
      );
    }
    if (u.role === 'CUSTOMER') {
      return query(
        `SELECT i.*, t.ticket_id FROM customer_issues i
         LEFT JOIN tickets t ON t.issue_id = i.id
         WHERE i.customer_id = ? ORDER BY i.id DESC`,
        [u.id]
      );
    }
    throw httpError(403, 'Forbidden');
  });

  // Manager reviews an issue and turns it into a ticket (optionally assigning an agent at once)
  app.post('/:id/create-ticket', { preHandler: [...auth, app.authorize('MANAGER')] }, async (req, reply) => {
    const id = idParam(req.params.id);
    const { agentId } = createTicketSchema.parse(req.body ?? {});
    const manager = req.currentUser;

    const ticketId = await withTx(async (conn) => {
      const [rows] = await conn.execute('SELECT * FROM customer_issues WHERE id = ? FOR UPDATE', [id]);
      const issue = rows[0];
      if (!issue) throw httpError(404, 'Issue not found');
      if (issue.status !== 'NEW') throw httpError(409, 'A ticket was already created for this issue');

      if (agentId) {
        const [a] = await conn.execute(
          "SELECT id FROM users WHERE id = ? AND role = 'AGENT' AND status = 'ACTIVE'",
          [agentId]
        );
        if (!a[0]) throw httpError(400, 'Agent not found or disabled');
      }

      const [res] = await conn.execute(
        `INSERT INTO tickets (issue_id, subject, description, category, customer_id, assigned_agent_id, created_by_manager, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'OPEN')`,
        [issue.id, issue.subject, issue.description, issue.category, issue.customer_id, agentId ?? null, manager.id]
      );
      await conn.execute("UPDATE customer_issues SET status = 'TICKET_CREATED' WHERE id = ?", [id]);
      await logHistory(res.insertId, manager.id, 'TICKET_CREATED', `Created by ${manager.name}`, conn);
      if (agentId) await logHistory(res.insertId, manager.id, 'ASSIGNED', 'Assigned at creation', conn);
      return res.insertId;
    });

    return reply.code(201).send({ ticketId });
  });
}
