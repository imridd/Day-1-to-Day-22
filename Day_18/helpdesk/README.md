# Helpdesk Gen-Z

## Setup

1. Extract the ZIP.
2. Open the extracted folder in VS Code.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. In `.env`, replace `JWT_SECRET` with a random string of at least 32 characters.
6. Run `npm start`.
7. Open `http://localhost:3000`.

## First manager login

On the first run, the server creates a manager in `data/users.json` using:

- Username: `manager` (or `MANAGER_USERNAME` in `.env`)
- Password: `Manager@123` (or `MANAGER_PASSWORD` in `.env`)

The password is stored as a salted scrypt hash, not plain text. Keep `data/users.json` safe.

## Features

- Manager login and agent registration.
- Manager creates tickets with High, Medium or Low priority.
- Tickets are sorted High -> Medium -> Low.
- Agents can pick an Open ticket; it becomes In Progress and is broadcast to every connected user.
- An agent account can have only one active login session at a time.
- Ticket and user data persist in JSON files under `data/`.
- Real-time team chat over WebSocket.

## Important

This is a local training/demo app. For production, use a database, HTTPS, stronger operational controls, rate limiting, audit logs and robust multi-process session coordination. JSON files and in-memory active-session tracking are intended for one Node.js process only.
