import { pool } from '../config/db.js';

export async function logHistory(ticketId, actorId, action, details = null, conn = pool) {
  await conn.execute(
    'INSERT INTO ticket_history (ticket_id, actor_id, action, details) VALUES (?, ?, ?, ?)',
    [ticketId, actorId, action, details]
  );
}
