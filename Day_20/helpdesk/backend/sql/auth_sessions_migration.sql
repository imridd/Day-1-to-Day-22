USE ticket_system;
ALTER TABLE active_sessions
  ADD COLUMN expires_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Existing sessions are intentionally expired so everyone signs in again.
UPDATE active_sessions SET expires_at = UTC_TIMESTAMP();
