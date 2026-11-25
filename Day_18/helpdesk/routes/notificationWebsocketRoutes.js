
import pool from '../config/database.js';

const POLL_INTERVAL = 3000;
const MAX_BATCH_SIZE = 20;

function isValidId(value) {
  return /^[0-9]+$/.test(String(value)) &&
    BigInt(value) >= 0n;
}

function getRecipient(payload) {
  if (payload.role === 'Customer') {
    const customerId = Number(payload.customerId);

    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      return null;
    }

    return {
      column: 'recipient_customer_id',
      id: customerId
    };
  }

  if (payload.role === 'Manager' || payload.role === 'Agent') {
    const agentId = Number(payload.agentId);

    if (!Number.isSafeInteger(agentId) || agentId <= 0) {
      return null;
    }

    return {
      column: 'recipient_agent_id',
      id: agentId
    };
  }

  return null;
}

async function validateSocketUser(payload) {
  const recipient = getRecipient(payload);

  if (!recipient) {
    return false;
  }

  if (payload.role === 'Customer') {
    const [customers] = await pool.execute(
      `SELECT customer_id
       FROM customers
       WHERE customer_id = ?
       LIMIT 1`,
      [recipient.id]
    );

    return customers.length > 0;
  }

  const [agents] = await pool.execute(
    `SELECT agent_id
     FROM agents
     WHERE agent_id = ?
       AND role = ?
       AND is_active = TRUE
     LIMIT 1`,
    [recipient.id, payload.role]
  );

  return agents.length > 0;
}

async function getNewNotifications(payload, lastSeenId) {
  const recipient = getRecipient(payload);

  if (!recipient) {
    throw new Error('Invalid notification recipient');
  }

  const [rows] = await pool.execute(
    `SELECT
       notification_id,
       related_ticket_id,
       notification_type,
       title,
       message,
       is_read,
       created_at,
       read_at
     FROM notifications
     WHERE ${recipient.column} = ?
       AND notification_id > ?
     ORDER BY notification_id ASC
     LIMIT ?`,
    [
      recipient.id,
      lastSeenId,
      MAX_BATCH_SIZE
    ]
  );

  return rows;
}

async function sendNewNotifications(socket, payload, state, fastify) {
  if (state.polling || socket.readyState !== 1) {
    return;
  }

  state.polling = true;

  try {
    // Revalidate the account on every polling cycle.
    const isValid = await validateSocketUser(payload);

    if (!isValid) {
      if (socket.readyState === 1) {
        socket.close(1008, 'Account is inactive or unavailable');
      }

      return;
    }

    const notifications = await getNewNotifications(
      payload,
      state.lastSeenId
    );

    for (const notification of notifications) {
      if (socket.readyState !== 1) {
        break;
      }

      const notificationId = String(
        notification.notification_id
      );

      socket.send(JSON.stringify({
        type: 'notification',
        data: notification
      }));

      // Advance only after the notification is queued for sending.
      state.lastSeenId = notificationId;
    }

  } catch (error) {
    fastify.log.error(
      error,
      'Notification WebSocket polling failed'
    );
  } finally {
    state.polling = false;
  }
}

async function notificationWebsocketRoutes(fastify) {
  fastify.get(
    '/ws/notifications',
    {
      websocket: true
    },
    (socket) => {
      let authenticated = false;
      let authenticating = false;
      let pollingInterval = null;
      let payload = null;

      const state = {
        lastSeenId: '0',
        polling: false
      };

      socket.on('message', async rawMessage => {
        if (authenticated || authenticating) {
          if (socket.readyState === 1) {
            socket.send(JSON.stringify({
              type: 'error',
              message: 'This connection is already authenticated'
            }));
          }

          return;
        }

        if (rawMessage.length > 4096) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Authentication message is too large'
          }));

          socket.close(1009, 'Message too large');
          return;
        }

        let data;

        try {
          data = JSON.parse(rawMessage.toString());
        } catch {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Invalid JSON message'
          }));

          return;
        }

        if (
          data.type !== 'authenticate' ||
          typeof data.token !== 'string' ||
          !data.token.trim()
        ) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Send an authentication message with a valid token'
          }));

          return;
        }

        // Optional reconnect cursor sent by the frontend.
        const lastSeenNotificationId =
          data.lastSeenNotificationId ?? '0';

        if (!isValidId(lastSeenNotificationId)) {
          socket.send(JSON.stringify({
            type: 'error',
            message: 'Invalid lastSeenNotificationId'
          }));

          return;
        }

        authenticating = true;

        try {
          payload = await fastify.jwt.verify(data.token);

          const isValid = await validateSocketUser(payload);

          if (!isValid) {
            throw new Error('Account is inactive or unavailable');
          }

          state.lastSeenId = String(
            BigInt(lastSeenNotificationId)
          );

          authenticated = true;
          authenticating = false;

          if (socket.readyState !== 1) {
            return;
          }

          socket.send(JSON.stringify({
            type: 'authenticated',
            message: 'Notification connection established',
            lastSeenNotificationId: state.lastSeenId
          }));

          // Deliver pending notifications immediately.
          await sendNewNotifications(
            socket,
            payload,
            state,
            fastify
          );

          // Continue checking for new notifications.
          pollingInterval = setInterval(() => {
            sendNewNotifications(
              socket,
              payload,
              state,
              fastify
            );
          }, POLL_INTERVAL);

        } catch (error) {
          authenticating = false;

          fastify.log.warn(
            error,
            'Notification WebSocket authentication failed'
          );

          if (socket.readyState === 1) {
            socket.send(JSON.stringify({
              type: 'authentication_failed',
              message: 'Invalid token or unavailable account'
            }));

            socket.close(1008, 'Authentication failed');
          }
        }
      });

      socket.on('close', () => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
      });

      socket.on('error', error => {
        fastify.log.error(
          error,
          'Notification WebSocket connection error'
        );

        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
      });
    }
  );
}

export default notificationWebsocketRoutes;
