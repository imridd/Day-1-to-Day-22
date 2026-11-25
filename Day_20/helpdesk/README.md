# Helpdesk: Ticket Management System

React + MUI + Zod frontend, Fastify + MySQL backend, JWT role-based access (Manager / Agent / Customer). Chat uses authenticated REST APIs with short-interval polling; no WebSocket or Socket.IO dependency.

## Folder structure

```
ticket-system/
├── backend/
│   ├── sql/schema.sql                 MySQL schema
│   └── src/
│       ├── server.js, app.js          Fastify bootstrap, CORS, rate limit, error handler
│       ├── config/                    env.js, db.js (mysql2 pool, prepared statements)
│       ├── plugins/auth.js            JWT + authenticate / authorize(role) guards
│       ├── schemas/index.js           Zod schemas
│       ├── utils/                     errors, history log, chatAccess (room rules)
│       ├── routes/                    auth, issues, tickets, attachments, agents, stats, chat
│       └── scripts/seedManager.js     creates the manager account
└── frontend/
    └── src/
        ├── api/axios.js               Axios instance + JWT interceptor
        ├── context/                   Auth and Toast (Context API)
        ├── validation/schemas.js      Zod schemas + validate() helper
        ├── components/                AppLayout, ProtectedRoute, TicketTable, TicketDetailDialog, ChatWindow ...
        └── pages/                     auth/, manager/, agent/, customer/, Chat.jsx
```

## Setup

Requirements: Node 18+, MySQL 8+.

1. Database
   ```
   mysql -u root -p < backend/sql/schema.sql
   ```
2. Backend
   ```
   cd backend
   cp .env.example .env        # set DB_PASSWORD, JWT_SECRET, manager credentials
   npm install
   npm run seed:manager        # creates the manager from .env (managers cannot self-register)
   npm run dev                 # http://localhost:5000
   ```
3. Frontend
   ```
   cd frontend
   cp .env.example .env
   npm install
   npm run dev                 # http://localhost:5173
   ```
4. Sign in as the manager, open Agents > Add agent. Customers sign up from the login page.

## Lifecycle

Customer raises issue -> Manager reviews it under Tickets > Customer issues and clicks Create ticket (optionally assigning an agent) -> an agent picks it up (or the manager assigned it) -> agent chats with the customer and updates status -> manager monitors workload and the Manager-Agent chat -> RESOLVED -> CLOSED.

## API (all under /api, JWT in `Authorization: Bearer <token>`)

| Method | Path | Roles | Purpose |
|---|---|---|---|
| POST | /auth/register | public | Customer signup |
| POST | /auth/login | public | Login (all roles) |
| GET | /auth/me | any | Current user |
| POST | /issues | customer | Raise issue |
| GET | /issues | manager, customer | List issues (manager: all, customer: own) |
| POST | /issues/:id/create-ticket | manager | Convert issue to ticket, optional `agentId` |
| GET | /tickets?status=&scope= | any | Manager all, customer own, agent `scope=mine` or `scope=pool` |
| GET | /tickets/:id | owner roles | Detail, history, notes, attachments |
| POST | /tickets/:id/pick | agent | Pick unassigned ticket (atomic lock) |
| PATCH | /tickets/:id/assign | manager | Assign, reassign or unassign (`agentId: null`) |
| PATCH | /tickets/:id/status | manager, assigned agent | Change status |
| POST | /tickets/:id/notes | assigned agent | Add note |
| POST | /tickets/:id/attachments | assigned agent | Upload file (multipart, 5 MB) |
| GET | /attachments/:id | manager, assigned agent | Download file |
| GET | /agents | manager | Agents with workload |
| POST | /agents | manager | Add agent |
| PUT | /agents/:id | manager | Edit agent |
| PATCH | /agents/:id/status | manager | Enable / disable |
| GET | /stats | any | Role-aware dashboard counts |
| GET | /chat/threads | any | Conversations this user may open |
| GET | /chat/:ticketId/:room/messages | room members | History / incremental polling (`afterId` supported) |
| POST | /chat/:ticketId/:room/messages | room members | Send a message (ticket must not be closed) |
| PATCH | /chat/:ticketId/:room/read | room members | Mark received messages as read |

## Chat updates

The chat UI polls the authenticated message endpoint every two seconds and refreshes conversation unread counts every five seconds. Messages are persisted in the `chats` table. This is intentionally implemented with regular HTTP requests; Socket.IO and WebSockets are not used.

## Chat isolation

Every history, send and read request calls `resolveChatAccess()` (backend/src/utils/chatAccess.js), which checks the user against the ticket in the database each time:

- CUSTOMER_AGENT room: only the ticket's customer and its currently assigned agent.
- MANAGER_AGENT room: managers and the currently assigned agent. Customers never get access.
- Reassigning a ticket moves access to the new agent immediately; the previous agent's next send or history call is rejected.

## Security notes

JWT + bcrypt (cost 12); disabled users are rejected on every authenticated request; parameterised SQL only; Zod on request bodies; global rate limit (200/min) and 10/min on login and register; CORS limited to `CLIENT_URL`; uploads limited to 5 MB and a type whitelist, stored under random names and served only through an authenticated route.
For production also serve over HTTPS, use a strong `JWT_SECRET`, and consider moving the token from localStorage to an httpOnly cookie.

## Single active login and refresh logout

The authentication update enforces one active login per user across Manager, Agent and Customer roles. The browser token is held in tab-scoped `sessionStorage` and in memory; a full page refresh logs the user out and calls the backend logout endpoint to release the database session. The frontend sends a heartbeat every 60 seconds. If a browser crashes without sending logout, the backend session lease expires after 3 minutes.

After updating an existing installation, run the SQL migration appropriate to your current database:
- If `active_sessions` does not exist, run the updated `backend/sql/schema.sql`.
- If you already created the earlier `active_sessions` table without `expires_at`, run `backend/sql/auth_sessions_migration.sql` once.

Then restart the backend and frontend.


## Ticket priority

Managers can set each ticket to HIGH, MEDIUM, or LOW. Agents can see the priority in their ticket list and ticket details but cannot change it. New tickets default to MEDIUM.

For an existing database, run `backend/sql/ticket_priority_migration.sql` exactly once in MySQL Workbench. For a brand-new database, the updated `backend/sql/schema.sql` already includes the priority column, so do not run the migration as well.
