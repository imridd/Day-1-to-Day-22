# Helpdesk — full-stack ticketing system

## Stack
- Frontend: Next.js (React), MUI, Recharts, responsive light/dark theme.
- Backend: NestJS, JavaScript ES modules, class-based controllers/services, MySQL.
- Tests: Node.js test runner (unit), Vitest + React Testing Library (component), API smoke tests, Playwright (end-to-end).

## Requirements
Node.js 20+, MySQL 8+.

## 1. Database
Create a MySQL database and run `backend/schema.sql`:

```sql
CREATE DATABASE helpdesk;
```

Then execute the schema file using MySQL Workbench or:

```bash
mysql -u root -p < backend/schema.sql
```

## 2. Backend
```bash
cd backend
cp .env.example .env
# Edit DB_USER, DB_PASSWORD, JWT_SECRET
npm install
npm run seed
npm run start:dev
```
API: http://localhost:3000/api

## 3. Frontend
In another terminal:
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```
Open http://localhost:5173 (Next.js is configured for port 5173).

## Demo logins
All demo accounts use `Helpdesk@123` (change after first use in a real deployment).

| Role | Email |
|---|---|
| Manager | manager@helpdesk.local |
| Agent | guna.agent@helpdesk.local |
| Agent | kavitha.agent@helpdesk.local |
| Agent | janet.agent@helpdesk.local |
| Customer | ridha@helpdesk.local |
| Customer | janet@helpdesk.local |
| Customer | dharani@helpdesk.local |
| Customer | kavitha@helpdesk.local |
| Customer | guna@helpdesk.local |

The seed script creates sample tickets and activity history. Demo names are fictional seed records.

## Implemented workflow
- Role-based login/register and one active session per account. Refresh restores the authenticated page; logout releases the session. A second login is rejected until logout/session expiry.
- Customers raise tickets, see their own tickets, track status, reopen resolved tickets (reopened tickets are tracked as a distinct status), and use ticket-scoped conversations.
- Managers see global ticket counts, filter/sort/page ticket tables, set priority when reviewing/assigning tickets, assign/unassign tickets, approve hold requests, resolve/close tickets, manage agents, inspect ticket history/chat, and export reports as CSV.
- Agents see their own work and eligible pick-up pool, claim tickets, automatically enter In Progress, log activities, request On Hold, complete work for manager review, and chat only in that ticket's thread.
- Presence heartbeat marks customers online/offline. When a customer with an on-hold ticket comes online, a manager notification is created. Manager can reopen/assign; an eligible agent can pick it.
- Chat is per-ticket, never a group room. Resolved/closed tickets are read-only; reopening reactivates the same ticket conversation.
- Dashboard cards, charts, table sorting/pagination, theme switch, responsive navigation, and CSV report export.

## Testing
```bash
# Unit tests
cd backend
npm test

# API smoke test (start the backend in another terminal first)
npm run test:api

# Component tests
cd ../frontend
npm test

# Install Playwright's browser once
npx playwright install chromium
# E2E tests (start MySQL, seed data, backend and frontend first)
npm run test:e2e
```
Playwright expects the backend and frontend to be running and the demo database to be seeded. The included tests are a starting regression suite; extend them for every business rule before production use.

## Notes
- `localhost:5173/` is the login landing page. Authenticated users are redirected to their role dashboard.
- A single-session lock is stored server-side in MySQL. Browser refresh does not release it; explicit logout or configured expiry does.
- Presence uses a 15-second heartbeat and a 45-second offline threshold. Browser tab close may take up to 45 seconds to register as offline.
- The API smoke test expects the backend to be running on port 3000.
- This is a runnable development baseline, not a production security audit. Configure HTTPS, rotate secrets, add rate limiting, backups, and operational monitoring before deployment.
