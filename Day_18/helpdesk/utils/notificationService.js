
import pool from '../config/database.js';

function validateRecipientId(id, fieldName) {
  const value = Number(id);

  if (
    !Number.isSafeInteger(value) ||
    value <= 0 ||
    value > 4294967295
  ) {
    throw new Error(`Invalid ${fieldName}`);
  }

  return value;
}

function validateTicketId(ticketId) {
  if (ticketId === null || ticketId === undefined) {
    return null;
  }

  const value = String(ticketId);

  if (!/^[1-9]\d*$/.test(value)) {
    throw new Error('Invalid ticket ID');
  }

  return value;
}

function validateNotificationContent({ type, title, message }) {
  if (
    typeof type !== 'string' ||
    !type.trim() ||
    typeof title !== 'string' ||
    !title.trim() ||
    typeof message !== 'string' ||
    !message.trim()
  ) {
    throw new Error('Invalid notification details');
  }

  return {
    type: type.trim(),
    title: title.trim(),
    message: message.trim()
  };
}

export async function createNotification({
  customerId = null,
  agentId = null,
  ticketId = null,
  type,
  title,
  message,
  connection = pool
}) {
  const hasCustomer = customerId !== null;
  const hasAgent = agentId !== null;

  if (hasCustomer === hasAgent) {
    throw new Error(
      'A notification must have exactly one recipient'
    );
  }

  const recipientCustomerId = hasCustomer
    ? validateRecipientId(customerId, 'customer ID')
    : null;

  const recipientAgentId = hasAgent
    ? validateRecipientId(agentId, 'agent ID')
    : null;

  const relatedTicketId = validateTicketId(ticketId);

  const content = validateNotificationContent({
    type,
    title,
    message
  });

  const [result] = await connection.execute(
    `INSERT INTO notifications (
       recipient_customer_id,
       recipient_agent_id,
       related_ticket_id,
       notification_type,
       title,
       message
     )
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      recipientCustomerId,
      recipientAgentId,
      relatedTicketId,
      content.type,
      content.title,
      content.message
    ]
  );

  return String(result.insertId);
}

export async function notifyManagers({
  ticketId = null,
  type,
  title,
  message,
  connection = pool
}) {
  const relatedTicketId = validateTicketId(ticketId);

  const content = validateNotificationContent({
    type,
    title,
    message
  });

  const [managers] = await connection.execute(
    `SELECT agent_id
     FROM agents
     WHERE role = 'Manager'
       AND is_active = TRUE`
  );

  if (managers.length === 0) {
    return 0;
  }

  const placeholders = managers
    .map(() => '(?, ?, ?, ?, ?, ?)')
    .join(', ');

  const values = managers.flatMap(manager => [
    null,
    manager.agent_id,
    relatedTicketId,
    content.type,
    content.title,
    content.message
  ]);

  await connection.execute(
    `INSERT INTO notifications (
       recipient_customer_id,
       recipient_agent_id,
       related_ticket_id,
       notification_type,
       title,
       message
     )
     VALUES ${placeholders}`,
    values
  );

  return managers.length;
}
