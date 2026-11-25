import { query } from '../config/db.js';

export const ROOMS = ['CUSTOMER_AGENT', 'MANAGER_AGENT'];
export async function resolveChatAccess(user, ticketId, room) {
  if (!ROOMS.includes(room)) return null;
  const rows = await query(
    'SELECT ticket_id, status, customer_id, assigned_agent_id, created_by_manager FROM tickets WHERE ticket_id = ?',
    [ticketId]
  );
  const ticket = rows[0];
  if (!ticket || !ticket.assigned_agent_id) return null;

  if (room === 'CUSTOMER_AGENT') {
    if (user.role === 'CUSTOMER' && ticket.customer_id === user.id)
      return { ticket, receiverId: ticket.assigned_agent_id };
    if (user.role === 'AGENT' && ticket.assigned_agent_id === user.id)
      return { ticket, receiverId: ticket.customer_id };
    return null;
  }

  if (user.role === 'MANAGER') return { ticket, receiverId: ticket.assigned_agent_id };
  if (user.role === 'AGENT' && ticket.assigned_agent_id === user.id)
    return { ticket, receiverId: ticket.created_by_manager };
  return null;
}
