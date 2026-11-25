import { query } from '../config/db.js';

const COUNTS = `
  COUNT(*) AS totalTickets,
  COALESCE(SUM(status = 'OPEN'), 0) AS openTickets,
  COALESCE(SUM(status = 'IN_PROGRESS'), 0) AS inProgressTickets,
  COALESCE(SUM(status = 'RESOLVED'), 0) AS resolvedTickets,
  COALESCE(SUM(status = 'CLOSED'), 0) AS closedTickets,
  COALESCE(SUM(assigned_agent_id IS NULL AND status <> 'CLOSED'), 0) AS unassignedTickets`;

const num = (row) => Object.fromEntries(Object.entries(row).map(([k, v]) => [k, Number(v)]));

export default async function statsRoutes(app) {
  // Role-aware numbers for the dashboard cards
  app.get('/', { preHandler: [app.authenticate] }, async (req) => {
    const u = req.currentUser;
    if (u.role === 'MANAGER') {
      const [t] = await query(`SELECT ${COUNTS} FROM tickets`);
      const [a] = await query("SELECT COUNT(*) AS totalAgents FROM users WHERE role = 'AGENT'");
      return num({ ...t, ...a });
    }
    if (u.role === 'AGENT') {
      const [t] = await query(`SELECT ${COUNTS} FROM tickets WHERE assigned_agent_id = ?`, [u.id]);
      const [p] = await query(
        "SELECT COUNT(*) AS availableTickets FROM tickets WHERE assigned_agent_id IS NULL AND status <> 'CLOSED'"
      );
      return num({ ...t, ...p });
    }
    const [t] = await query(`SELECT ${COUNTS} FROM tickets WHERE customer_id = ?`, [u.id]);
    return num(t);
  });
}
