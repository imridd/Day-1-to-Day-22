CREATE DATABASE IF NOT EXISTS ticket_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ticket_system;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mobile VARCHAR(20) NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('MANAGER','AGENT','CUSTOMER') NOT NULL,
  status ENUM('ACTIVE','DISABLED') NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_users_role (role)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_issues (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  subject VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  status ENUM('NEW','TICKET_CREATED') NOT NULL DEFAULT 'NEW',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_issue_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  INDEX idx_issue_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  issue_id INT UNSIGNED NULL UNIQUE,
  subject VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  priority ENUM('HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'MEDIUM',
  customer_id INT UNSIGNED NOT NULL,
  assigned_agent_id INT UNSIGNED NULL,
  created_by_manager INT UNSIGNED NOT NULL,
  status ENUM('OPEN','IN_PROGRESS','RESOLVED','CLOSED') NOT NULL DEFAULT 'OPEN',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ticket_issue FOREIGN KEY (issue_id) REFERENCES customer_issues(id),
  CONSTRAINT fk_ticket_customer FOREIGN KEY (customer_id) REFERENCES users(id),
  CONSTRAINT fk_ticket_agent FOREIGN KEY (assigned_agent_id) REFERENCES users(id),
  CONSTRAINT fk_ticket_manager FOREIGN KEY (created_by_manager) REFERENCES users(id),
  INDEX idx_ticket_status (status),
  INDEX idx_ticket_priority (priority),
  INDEX idx_ticket_agent (assigned_agent_id),
  INDEX idx_ticket_customer (customer_id)
) ENGINE=InnoDB AUTO_INCREMENT=101;

CREATE TABLE IF NOT EXISTS ticket_notes (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT UNSIGNED NOT NULL,
  agent_id INT UNSIGNED NOT NULL,
  note TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_note_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  CONSTRAINT fk_note_agent FOREIGN KEY (agent_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ticket_attachments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT UNSIGNED NOT NULL,
  uploaded_by INT UNSIGNED NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_name VARCHAR(100) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size INT UNSIGNED NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_att_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  CONSTRAINT fk_att_user FOREIGN KEY (uploaded_by) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ticket_history (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT UNSIGNED NOT NULL,
  actor_id INT UNSIGNED NULL,
  action VARCHAR(40) NOT NULL,
  details VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_hist_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  INDEX idx_hist_ticket (ticket_id)
) ENGINE=InnoDB;

-- "room" separates the two private conversations that can exist on one ticket
CREATE TABLE IF NOT EXISTS chats (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT UNSIGNED NOT NULL,
  room ENUM('CUSTOMER_AGENT','MANAGER_AGENT') NOT NULL,
  sender_id INT UNSIGNED NOT NULL,
  receiver_id INT UNSIGNED NOT NULL,
  message TEXT NOT NULL,
  read_status TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_chat_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(ticket_id) ON DELETE CASCADE,
  CONSTRAINT fk_chat_sender FOREIGN KEY (sender_id) REFERENCES users(id),
  CONSTRAINT fk_chat_receiver FOREIGN KEY (receiver_id) REFERENCES users(id),
  INDEX idx_chat_room (ticket_id, room, id)
) ENGINE=InnoDB;


-- One active login per user across Manager, Agent and Customer roles.
-- The 3-minute lease is renewed by authenticated API requests and frontend heartbeat.
CREATE TABLE IF NOT EXISTS active_sessions (
  user_id INT UNSIGNED NOT NULL PRIMARY KEY,
  session_id CHAR(36) NOT NULL UNIQUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_activity DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  CONSTRAINT fk_active_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
