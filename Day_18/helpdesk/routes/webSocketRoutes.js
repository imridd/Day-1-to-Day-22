
import pool from '../config/database.js';

import {
  createNotification,
  notifyManagers
} from '../utils/notificationService.js';

const connectedUsers = new Map();
const agentSessions = new Map();

const MAX_MESSAGE_SIZE = 8192;
const MAX_GLOBAL_MESSAGE_LENGTH = 2000;
const MAX_TICKET_MESSAGE_LENGTH = 10000;
const MAX_EVENTS_PER_MINUTE = 20;

function send(socket, data) {
  if (socket.readyState === 1) {
    socket.send(JSON.stringify(data));
  }
}

function isValidId(value) {
  return (
    (typeof value === 'string' || typeof value === 'number') &&
    /^[1-9]\d*$/.test(String(value))
  );
}

function validateMessageText(value, maxLength) {
  return (
    typeof value === 'string' &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
}

function removeSocket(socket) {
  const user = connectedUsers.get(socket);

  connectedUsers.delete(socket);

  if (
    user &&
    (user.role === 'Agent' || user.role === 'Manager') &&
    agentSessions.get(user.id) === socket
  ) {
    agentSessions.delete(user.id);
  }

  return user;
}

function getOnlineStaff() {
  return [...connectedUsers.values()]
    .filter(user =>
      user.role === 'Agent' || user.role === 'Manager'
    )
    .map(user => ({
      id: user.id,
      name: user.name,
      role: user.role
    }));
}

function broadcastOnlineUsers() {
  const data = {
    type: 'online_users',
    users: getOnlineStaff()
  };

  for (const socket of connectedUsers.keys()) {
    send(socket, data);
  }
}

async function authenticateSocket(fastify, token) {
  if (typeof token !== 'string' || !token.trim()) {
    throw new Error('Authentication token is required');
  }

  const payload = await fastify.jwt.verify(token);

  if (
    !payload.exp ||
    Math.floor(Date.now() / 1000) >= payload.exp
  ) {
    throw new Error('Authentication token has expired');
  }

  if (
    payload.role === 'Manager' ||
    payload.role === 'Agent'
  ) {
    const agentId = Number(payload.agentId);

    if (!Number.isSafeInteger(agentId) || agentId <= 0) {
      throw new Error('Invalid staff identity');
    }

    const [agents] = await pool.execute(
      `SELECT agent_id, full_name, email, role, is_active
       FROM agents
       WHERE agent_id = ?
       LIMIT 1`,
      [agentId]
    );

    if (
      agents.length === 0 ||
      !agents[0].is_active ||
      agents[0].role !== payload.role
    ) {
      throw new Error('Staff account is inactive or invalid');
    }

    return {
      id: Number(agents[0].agent_id),
      name: agents[0].full_name,
      email: agents[0].email,
      role: agents[0].role,
      tokenExpiresAt: payload.exp
    };
  }

  if (payload.role === 'Customer') {
    const customerId = Number(payload.customerId);

    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      throw new Error('Invalid customer identity');
    }

    const [customers] = await pool.execute(
      `SELECT customer_id, full_name, email
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [customerId]
    );

    if (customers.length === 0) {
      throw new Error('Customer account not found');
    }

    return {
      id: Number(customers[0].customer_id),
      name: customers[0].full_name,
      email: customers[0].email,
      role: 'Customer',
      tokenExpiresAt: payload.exp
    };
  }

  throw new Error('Invalid user role');
}

async function refreshSocketUser(user) {
  if (
    !user.tokenExpiresAt ||
    Math.floor(Date.now() / 1000) >= user.tokenExpiresAt
  ) {
    throw new Error('Authentication token has expired');
  }

  if (user.role === 'Manager' || user.role === 'Agent') {
    const [agents] = await pool.execute(
      `SELECT agent_id, full_name, email, role, is_active
       FROM agents
       WHERE agent_id = ?
       LIMIT 1`,
      [user.id]
    );

    if (
      agents.length === 0 ||
      !agents[0].is_active ||
      agents[0].role !== user.role
    ) {
      throw new Error('Staff account is inactive or invalid');
    }

    return {
      id: Number(agents[0].agent_id),
      name: agents[0].full_name,
      email: agents[0].email,
      role: agents[0].role,
      tokenExpiresAt: user.tokenExpiresAt
    };
  }

  if (user.role === 'Customer') {
    const [customers] = await pool.execute(
      `SELECT customer_id, full_name, email
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [user.id]
    );

    if (customers.length === 0) {
      throw new Error('Customer account not found');
    }

    return {
      id: Number(customers[0].customer_id),
      name: customers[0].full_name,
      email: customers[0].email,
      role: 'Customer',
      tokenExpiresAt: user.tokenExpiresAt
    };
  }

  throw new Error('Invalid user role');
}

// SEND ONLY TO VALID CONNECTED RECIPIENTS
async function sendToValidatedRecipients(recipients, data) {
  const checks = [...connectedUsers.entries()].map(
    async ([socket, user]) => {
      if (!recipients(user)) {
        return;
      }

      try {
        const refreshedUser = await refreshSocketUser(user);

        if (socket.readyState !== 1) {
          removeSocket(socket);
          return;
        }

        connectedUsers.set(socket, refreshedUser);
        send(socket, data);

      } catch {
        removeSocket(socket);

        if (socket.readyState === 1) {
          socket.close(1008, 'Account inactive or session expired');
        }
      }
    }
  );

  await Promise.all(checks);
}

// GLOBAL MESSAGE PERSISTENCE
async function saveGlobalMessage(user, messageText) {
  const senderType =
    user.role === 'Customer' ? 'Customer' : 'Staff';

  const customerId =
    senderType === 'Customer' ? user.id : null;

  const agentId =
    senderType === 'Staff' ? user.id : null;

  const [result] = await pool.execute(
    `INSERT INTO global_messages (
       sender_type,
       sender_customer_id,
       sender_agent_id,
       message_text
     )
     VALUES (?, ?, ?, ?)`,
    [
      senderType,
      customerId,
      agentId,
      messageText
    ]
  );

  const [messages] = await pool.execute(
    `SELECT
       g.global_message_id,
       g.sender_type,
       g.sender_customer_id,
       g.sender_agent_id,
       g.message_text,
       g.created_at,
       CASE
         WHEN g.sender_type = 'Customer'
           THEN c.full_name
         ELSE a.full_name
       END AS sender_name
     FROM global_messages g
     LEFT JOIN customers c
       ON c.customer_id = g.sender_customer_id
     LEFT JOIN agents a
       ON a.agent_id = g.sender_agent_id
     WHERE g.global_message_id = ?`,
    [result.insertId]
  );

  return messages[0];
}

// GLOBAL CHAT HISTORY
async function getGlobalHistory(data) {
  const requestedLimit = Number(data.limit ?? 50);

  if (
    !Number.isInteger(requestedLimit) ||
    requestedLimit < 1
  ) {
    throw new Error('Invalid history limit');
  }

  const limit = Math.min(requestedLimit, 100);
  const beforeId = data.beforeMessageId;

  if (
    beforeId !== undefined &&
    !isValidId(beforeId)
  ) {
    throw new Error('Invalid beforeMessageId');
  }

  let sql = `
    SELECT
      g.global_message_id,
      g.sender_type,
      g.sender_customer_id,
      g.sender_agent_id,
      g.message_text,
      g.created_at,
      CASE
        WHEN g.sender_type = 'Customer'
          THEN c.full_name
        ELSE a.full_name
      END AS sender_name
    FROM global_messages g
    LEFT JOIN customers c
      ON c.customer_id = g.sender_customer_id
    LEFT JOIN agents a
      ON a.agent_id = g.sender_agent_id
  `;

  const params = [];

  if (beforeId !== undefined) {
    sql += ` WHERE g.global_message_id < ?`;
    params.push(String(beforeId));
  }

  sql += `
    ORDER BY g.global_message_id DESC
    LIMIT ?
  `;

  params.push(limit);

  const [messages] = await pool.execute(sql, params);

  messages.reverse();

  return messages;
}

// PRIVATE MANAGER-AGENT MESSAGE
async function savePrivateMessage(user, data) {
  const ticketId = String(data.ticketId);
  const messageText = data.message_text.trim();

  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    const [tickets] = await connection.execute(
      `SELECT ticket_id, assigned_agent_id
       FROM tickets
       WHERE ticket_id = ?
       FOR UPDATE`,
      [ticketId]
    );

    if (tickets.length === 0) {
      throw new Error('Ticket not found');
    }

    const [pairings] = await connection.execute(
      `SELECT
         chat_participant_id,
         manager_agent_id,
         assigned_agent_id
       FROM ticket_chat_participants
       WHERE ticket_id = ?
         AND ended_at IS NULL
       ORDER BY started_at DESC, chat_participant_id DESC
       LIMIT 1
       FOR UPDATE`,
      [ticketId]
    );

    if (pairings.length === 0) {
      throw new Error('No active private chat pairing exists');
    }

    const pairing = pairings[0];

    if (
      tickets[0].assigned_agent_id === null ||
      Number(tickets[0].assigned_agent_id) !==
        Number(pairing.assigned_agent_id)
    ) {
      throw new Error(
        'The active pairing no longer matches the ticket assignment'
      );
    }

    const isManager =
      user.role === 'Manager' &&
      Number(user.id) === Number(pairing.manager_agent_id);

    const isAgent =
      user.role === 'Agent' &&
      Number(user.id) === Number(pairing.assigned_agent_id);

    if (!isManager && !isAgent) {
      throw new Error('You are not part of this private chat');
    }

    const [result] = await connection.execute(
      `INSERT INTO ticket_private_messages (
         ticket_id,
         manager_agent_id,
         assigned_agent_id,
         sender_agent_id,
         message_text
       )
       VALUES (?, ?, ?, ?, ?)`,
      [
        ticketId,
        pairing.manager_agent_id,
        pairing.assigned_agent_id,
        user.id,
        messageText
      ]
    );

    const [messages] = await connection.execute(
      `SELECT
         m.private_message_id,
         m.ticket_id,
         m.manager_agent_id,
         m.assigned_agent_id,
         m.sender_agent_id,
         a.full_name AS sender_name,
         m.message_text,
         m.created_at
       FROM ticket_private_messages m
       INNER JOIN agents a
         ON a.agent_id = m.sender_agent_id
       WHERE m.private_message_id = ?`,
      [result.insertId]
    );

    // NOTIFY THE OTHER PRIVATE CHAT PARTICIPANT
    const recipientAgentId = isManager
      ? pairing.assigned_agent_id
      : pairing.manager_agent_id;

    await createNotification({
      agentId: recipientAgentId,
      ticketId,
      type: 'PRIVATE_MESSAGE',
      title: 'New private ticket message',
      message: `${user.name} sent you a private message on ticket #${ticketId}.`,
      connection
    });

    await connection.commit();
    transactionStarted = false;

    return messages[0];

  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }

    throw error;

  } finally {
    connection.release();
  }
}

// CUSTOMER-VISIBLE TICKET MESSAGE
async function saveTicketMessage(user, data) {
  const ticketId = String(data.ticketId);
  const messageText = data.message_text.trim();

  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;

    const [tickets] = await connection.execute(
      `SELECT
         ticket_id,
         customer_id,
         assigned_agent_id
       FROM tickets
       WHERE ticket_id = ?
       FOR UPDATE`,
      [ticketId]
    );

    if (tickets.length === 0) {
      throw new Error('Ticket not found');
    }

    const ticket = tickets[0];

    let senderType;
    let customerId = null;
    let agentId = null;

    if (user.role === 'Customer') {
      if (Number(ticket.customer_id) !== Number(user.id)) {
        throw new Error('You cannot send messages to this ticket');
      }

      senderType = 'Customer';
      customerId = user.id;

    } else if (user.role === 'Manager') {
      senderType = 'Staff';
      agentId = user.id;

    } else if (user.role === 'Agent') {
      if (
        ticket.assigned_agent_id === null ||
        Number(ticket.assigned_agent_id) !== Number(user.id)
      ) {
        throw new Error(
          'Only the assigned Agent can send messages'
        );
      }

      senderType = 'Staff';
      agentId = user.id;

    } else {
      throw new Error('Invalid sender role');
    }

    const [result] = await connection.execute(
      `INSERT INTO ticket_messages (
         ticket_id,
         sender_type,
         sender_customer_id,
         sender_agent_id,
         visibility,
         message_text
       )
       VALUES (?, ?, ?, ?, 'Customer', ?)`,
      [
        ticketId,
        senderType,
        customerId,
        agentId,
        messageText
      ]
    );

    const [messages] = await connection.execute(
      `SELECT
         m.message_id,
         m.ticket_id,
         m.sender_type,
         m.sender_customer_id,
         m.sender_agent_id,
         m.visibility,
         m.message_text,
         m.created_at,
         CASE
           WHEN m.sender_type = 'Customer'
             THEN c.full_name
           ELSE a.full_name
         END AS sender_name
       FROM ticket_messages m
       LEFT JOIN customers c
         ON c.customer_id = m.sender_customer_id
       LEFT JOIN agents a
         ON a.agent_id = m.sender_agent_id
       WHERE m.message_id = ?`,
      [result.insertId]
    );

    // NOTIFICATION INTEGRATION
    if (user.role === 'Customer') {
      // Notify the currently assigned Agent.
      if (ticket.assigned_agent_id !== null) {
        await createNotification({
          agentId: ticket.assigned_agent_id,
          ticketId,
          type: 'TICKET_MESSAGE',
          title: 'New customer ticket message',
          message: `${user.name} sent a new message on ticket #${ticketId}.`,
          connection
        });
      }

      // Notify all active Managers.
      await notifyManagers({
        ticketId,
        type: 'TICKET_MESSAGE',
        title: 'New customer ticket message',
        message: `${user.name} sent a new message on ticket #${ticketId}.`,
        connection
      });

    } else {
      // Notify the ticket's Customer.
      await createNotification({
        customerId: ticket.customer_id,
        ticketId,
        type: 'TICKET_MESSAGE',
        title: 'New ticket reply',
        message: `${user.name} replied to your ticket #${ticketId}.`,
        connection
      });
    }

    await connection.commit();
    transactionStarted = false;

    return {
      ticket,
      message: messages[0]
    };

  } catch (error) {
    if (transactionStarted) {
      await connection.rollback();
    }

    throw error;

  } finally {
    connection.release();
  }
}

async function websocketRoutes(fastify) {
  fastify.get(
    '/ws',
    {
      websocket: true
    },
    (socket) => {
      let authenticatedUser = null;
      let messageCount = 0;
      let rateWindowStart = Date.now();
      let authenticationInProgress = false;
      let processingMessage = false;

      send(socket, {
        type: 'connection',
        message: 'Connected. Authenticate to continue.',
        requiresAuthentication: true
      });

      socket.on('message', async rawMessage => {
        if (rawMessage.length > MAX_MESSAGE_SIZE) {
          send(socket, {
            type: 'error',
            message: 'Message is too large'
          });

          socket.close(1009, 'Message too large');
          return;
        }

        if (processingMessage) {
          send(socket, {
            type: 'error',
            message: 'Please wait for the previous message to finish'
          });

          return;
        }

        processingMessage = true;

        try {
          let data;

          try {
            data = JSON.parse(rawMessage.toString());
          } catch {
            send(socket, {
              type: 'error',
              message: 'Invalid JSON message'
            });

            return;
          }

          if (!data || typeof data !== 'object' || Array.isArray(data)) {
            send(socket, {
              type: 'error',
              message: 'Invalid message format'
            });

            return;
          }

          // AUTHENTICATION
          if (!authenticatedUser) {
            if (authenticationInProgress) {
              return;
            }

            if (
              data.type !== 'authenticate' ||
              typeof data.token !== 'string' ||
              !data.token.trim()
            ) {
              send(socket, {
                type: 'error',
                message: 'Authentication required'
              });

              socket.close(1008, 'Authentication required');
              return;
            }

            authenticationInProgress = true;

            try {
              const user = await authenticateSocket(
                fastify,
                data.token
              );

              if (socket.readyState !== 1) {
                return;
              }

              if (
                user.role === 'Agent' ||
                user.role === 'Manager'
              ) {
                const previousSocket = agentSessions.get(user.id);

                if (previousSocket && previousSocket !== socket) {
                  removeSocket(previousSocket);

                  previousSocket.close(
                    4001,
                    'Session replaced'
                  );
                }

                agentSessions.set(user.id, socket);
              }

              authenticatedUser = user;
              connectedUsers.set(socket, user);

              send(socket, {
                type: 'authenticated',
                message: 'WebSocket authentication successful',
                user: {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  role: user.role
                }
              });

              broadcastOnlineUsers();

            } catch (error) {
              fastify.log.warn(
                error,
                'WebSocket authentication failed'
              );

              send(socket, {
                type: 'error',
                message: 'Authentication failed'
              });

              socket.close(1008, 'Authentication failed');

            } finally {
              authenticationInProgress = false;
            }

            return;
          }

          // RATE LIMIT
          const now = Date.now();

          if (now - rateWindowStart >= 60000) {
            rateWindowStart = now;
            messageCount = 0;
          }

          messageCount++;

          if (messageCount > MAX_EVENTS_PER_MINUTE) {
            send(socket, {
              type: 'error',
              message: 'Message limit exceeded. Try again later.'
            });

            return;
          }

          // REVALIDATE USER AND TOKEN
          try {
            authenticatedUser = await refreshSocketUser(
              authenticatedUser
            );

            connectedUsers.set(socket, authenticatedUser);

          } catch (error) {
            removeSocket(socket);

            send(socket, {
              type: 'error',
              message: 'Your account is no longer active or your session has expired'
            });

            socket.close(1008, 'Session expired or account inactive');
            broadcastOnlineUsers();

            return;
          }

          // PING / PONG
          if (data.type === 'ping') {
            send(socket, {
              type: 'pong',
              timestamp: new Date().toISOString()
            });

            return;
          }

          // GLOBAL CHAT
          if (data.type === 'global_message') {
            if (!validateMessageText(
              data.message_text,
              MAX_GLOBAL_MESSAGE_LENGTH
            )) {
              send(socket, {
                type: 'error',
                message: 'Global message must contain 1 to 2000 characters'
              });

              return;
            }

            const message = await saveGlobalMessage(
              authenticatedUser,
              data.message_text.trim()
            );

            await sendToValidatedRecipients(
              () => true,
              {
                type: 'global_message',
                message
              }
            );

            return;
          }

          // GLOBAL CHAT HISTORY
          if (data.type === 'global_history') {
            const messages = await getGlobalHistory(data);

            send(socket, {
              type: 'global_history',
              messages
            });

            return;
          }

          // CUSTOMER-VISIBLE TICKET CHAT
          if (data.type === 'ticket_message') {
            if (!isValidId(data.ticketId)) {
              send(socket, {
                type: 'error',
                message: 'Invalid ticket ID'
              });

              return;
            }

            if (!validateMessageText(
              data.message_text,
              MAX_TICKET_MESSAGE_LENGTH
            )) {
              send(socket, {
                type: 'error',
                message: 'Ticket message must contain 1 to 10000 characters'
              });

              return;
            }

            const result = await saveTicketMessage(
              authenticatedUser,
              data
            );

            await sendToValidatedRecipients(
              user => {
                const isCustomer =
                  user.role === 'Customer' &&
                  Number(user.id) === Number(result.ticket.customer_id);

                const isManager = user.role === 'Manager';

                const isAssignedAgent =
                  user.role === 'Agent' &&
                  result.ticket.assigned_agent_id !== null &&
                  Number(user.id) ===
                    Number(result.ticket.assigned_agent_id);

                return isCustomer || isManager || isAssignedAgent;
              },
              {
                type: 'ticket_message',
                message: result.message
              }
            );

            return;
          }

          // PRIVATE MANAGER-AGENT CHAT
          if (data.type === 'private_ticket_message') {
            if (
              authenticatedUser.role !== 'Manager' &&
              authenticatedUser.role !== 'Agent'
            ) {
              send(socket, {
                type: 'error',
                message: 'Customers cannot use private staff chat'
              });

              return;
            }

            if (!isValidId(data.ticketId)) {
              send(socket, {
                type: 'error',
                message: 'Invalid ticket ID'
              });

              return;
            }

            if (!validateMessageText(
              data.message_text,
              MAX_TICKET_MESSAGE_LENGTH
            )) {
              send(socket, {
                type: 'error',
                message: 'Private message must contain 1 to 10000 characters'
              });

              return;
            }

            const message = await savePrivateMessage(
              authenticatedUser,
              data
            );

            await sendToValidatedRecipients(
              user =>
                (
                  user.role === 'Manager' &&
                  Number(user.id) === Number(message.manager_agent_id)
                ) ||
                (
                  user.role === 'Agent' &&
                  Number(user.id) === Number(message.assigned_agent_id)
                ),
              {
                type: 'private_ticket_message',
                message
              }
            );

            return;
          }

          send(socket, {
            type: 'error',
            message: 'Unsupported WebSocket event'
          });

        } catch (error) {
          fastify.log.error(error);

          send(socket, {
            type: 'error',
            message: error.message || 'Unable to process message'
          });

        } finally {
          processingMessage = false;
        }
      });

      socket.on('close', () => {
        const user = removeSocket(socket);

        if (
          user &&
          (user.role === 'Agent' || user.role === 'Manager')
        ) {
          pool.execute(
            `UPDATE agents
             SET last_seen_at = CURRENT_TIMESTAMP
             WHERE agent_id = ?`,
            [user.id]
          ).catch(error => {
            fastify.log.error(error);
          });
        }

        if (user) {
          broadcastOnlineUsers();
        }
      });

      socket.on('error', error => {
        fastify.log.error(
          error,
          'WebSocket connection error'
        );
      });
    }
  );
}

export default websocketRoutes;
