import 'dotenv/config';
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import jwt from 'jsonwebtoken';
import { WebSocket, WebSocketServer } from 'ws';

const PORT = Number(process.env.PORT || 3000);
const APP_ORIGIN = new URL(
  process.env.APP_ORIGIN || `http://localhost:${PORT}`
).origin;

const JWT_SECRET = process.env.JWT_SECRET;

const ISSUER = 'helpdesk-training';
const AUDIENCE = 'helpdesk-browser';

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error('Invalid Port');
}

if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters');
}

const demoUsers = [
  {
    id: 'u-101',
    username: 'agent',
    password: 'Agent@123',
    role: 'agent'
  },
  {
    id: 'u-102',
    username: 'manager',
    password: 'Manager@123',
    role: 'manager'
  }
];

const ticket = {
  id: 'T-101',
  title: 'Customer cannot download invoice',
  status: 'Open'
};

// JSON response
function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  });

  res.end(JSON.stringify(data));
}

// Read JSON body
async function readJSON(req) {
  let body = '';

  for await (const chunk of req) {
    body += chunk.toString();

    if (Buffer.byteLength(body, 'utf8') > 8192) {
      const error = new Error('Request body too large');
      error.status = 413;
      throw error;
    }
  }

  if (!body.trim()) {
    const error = new Error('Request body is required');
    error.status = 400;
    throw error;
  }

  try {
    return JSON.parse(body);
  } catch {
    const error = new Error('Invalid JSON request body');
    error.status = 400;
    throw error;
  }
}

// Verify JWT
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    algorithms: ['HS256'],
    issuer: ISSUER,
    audience: AUDIENCE
  });
}

// HTTP server
const server = http.createServer(async (req, res) => {
  try {
    const pathname = new URL(req.url, APP_ORIGIN).pathname;

    // Home page
    if (req.method === 'GET' && pathname === '/') {
      const html = await readFile(
        new URL('./public/index.html', import.meta.url)
      );

      res.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
      });

      return res.end(html);
    }

    // Login
    if (req.method === 'POST' && pathname === '/api/login') {
      if (!req.headers['content-type']?.startsWith('application/json')) {
        return sendJSON(res, 415, {
          error: 'Content-Type must be application/json'
        });
      }

      const { username, password } = await readJSON(req);

      if (typeof username !== 'string' || typeof password !== 'string') {
        return sendJSON(res, 400, {
          error: 'Username and password are required'
        });
      }

      const account = demoUsers.find(user =>
        user.username === username &&
        user.password === password
      );

      if (!account) {
        return sendJSON(res, 401, {
          error: 'Invalid username or password'
        });
      }

      const token = jwt.sign(
        {
          username: account.username,
          role: account.role
        },
        JWT_SECRET,
        {
          algorithm: 'HS256',
          subject: account.id,
          issuer: ISSUER,
          audience: AUDIENCE,
          expiresIn: '15m'
        }
      );

      return sendJSON(res, 200, {
        token,
        tokenType: 'Bearer',
        expiresInSeconds: 900,
        user: {
          id: account.id,
          username: account.username,
          role: account.role
        }
      });
    }

    // Protected profile
    if (req.method === 'GET' && pathname === '/api/profile') {
      const authorization = req.headers.authorization || '';

      if (!authorization.startsWith('Bearer ')) {
        return sendJSON(res, 401, {
          error: 'Bearer token required'
        });
      }

      try {
        const payload = verifyToken(authorization.slice(7));

        return sendJSON(res, 200, {
          id: payload.sub,
          username: payload.username,
          role: payload.role
        });
      } catch {
        return sendJSON(res, 401, {
          error: 'Invalid or expired token'
        });
      }
    }

    return sendJSON(res, 404, {
      error: 'Route not found'
    });

  } catch (error) {
    console.error('HTTP error:', error.message);

    if (!res.headersSent) {
      return sendJSON(res, error.status || 500, {
        error: error.status
          ? error.message
          : 'Internal Server Error'
      });
    }

    res.destroy();
  }
});

// WebSocket server
const wss = new WebSocketServer({
  noServer: true,
  maxPayload: 16 * 1024,
  perMessageDeflate: false
});

// Send WebSocket JSON
function send(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// Broadcast
function broadcast(data) {
  for (const client of wss.clients) {
    if (
      client.identity &&
      Date.now() < client.identity.exp * 1000
    ) {
      send(client, data);
    }
  }
}

// WebSocket upgrade
server.on('upgrade', (req, socket, head) => {
  try {
    const pathname = new URL(req.url, APP_ORIGIN).pathname;

    if (
      pathname !== '/ws' ||
      req.headers.origin !== APP_ORIGIN
    ) {
      socket.write(
        'HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n'
      );
      socket.destroy();
      return;
    }

    wss.handleUpgrade(req, socket, head, ws => {
      wss.emit('connection', ws, req);
    });

  } catch {
    socket.destroy();
  }
});

// WebSocket connection
wss.on('connection', ws => {
  ws.identity = null;

  let expiryTimer;

  const authTimer = setTimeout(() => {
    ws.close(1008, 'Authentication timeout');
  }, 5000);

  ws.on('message', (raw, isBinary) => {
    if (isBinary) {
      ws.close(1003, 'Text JSON only');
      return;
    }

    let message;

    try {
      message = JSON.parse(raw.toString('utf8'));

      if (!message || typeof message !== 'object' || Array.isArray(message)) {
        throw new Error('Invalid message');
      }
    } catch {
      send(ws, {
        type: 'error',
        message: 'Invalid JSON message'
      });
      return;
    }

    // Authentication
    if (!ws.identity) {
      if (
        message.type !== 'auth' ||
        typeof message.token !== 'string'
      ) {
        ws.close(1008, 'Authentication required');
        return;
      }

      try {
        const payload = verifyToken(message.token);

        if (
          !payload.sub ||
          !['agent', 'manager'].includes(payload.role) ||
          !demoUsers.some(
            user =>
              user.id === payload.sub &&
              user.username === payload.username &&
              user.role === payload.role
          )
        ) {
          throw new Error('Invalid identity');
        }

        ws.identity = {
          id: payload.sub,
          username: payload.username,
          role: payload.role,
          exp: payload.exp
        };

        clearTimeout(authTimer);

        expiryTimer = setTimeout(() => {
          ws.close(1008, 'Token expired');
        }, Math.max(0, payload.exp * 1000 - Date.now()));

        send(ws, {
          type: 'auth:ok',
          user: {
            username: payload.username,
            role: payload.role
          },
          ticket
        });

      } catch {
        ws.close(1008, 'Invalid or expired token');
      }

      return;
    }

    // Token expiry
    if (Date.now() >= ws.identity.exp * 1000) {
      ws.close(1008, 'Token expired');
      return;
    }

    // Chat
    if (message.type === 'chat:send') {
      const text = typeof message.text === 'string'
        ? message.text.trim()
        : '';

      if (!text || text.length > 500) {
        send(ws, {
          type: 'error',
          message: 'Message must be 1 - 500 characters'
        });
        return;
      }

      broadcast({
        type: 'chat:new',
        from: ws.identity.username,
        role: ws.identity.role,
        text,
        sentAt: new Date().toISOString()
      });

      return;
    }

    // Manager ticket update
    if (message.type === 'ticket:update') {
      if (ws.identity.role !== 'manager') {
        send(ws, {
          type: 'error',
          message: 'Managers only: access denied'
        });
        return;
      }

      const statuses = [
        'Open',
        'In Progress',
        'Resolved'
      ];

      if (
        message.ticketId !== ticket.id ||
        !statuses.includes(message.status)
      ) {
        send(ws, {
          type: 'error',
          message: 'Invalid ticket update'
        });
        return;
      }

      ticket.status = message.status;

      broadcast({
        type: 'ticket:updated',
        ticket: { ...ticket },
        updatedBy: ws.identity.username,
        updatedAt: new Date().toISOString()
      });

      return;
    }

    send(ws, {
      type: 'error',
      message: 'Unsupported event type'
    });
  });

  ws.on('close', () => {
    clearTimeout(authTimer);
    clearTimeout(expiryTimer);
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error.message);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Helpdesk demo: ${APP_ORIGIN}`);
  console.log('Demo Users: agent / Agent@123, manager / Manager@123');
});
