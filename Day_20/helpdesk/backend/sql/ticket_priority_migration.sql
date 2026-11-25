USE ticket_system;

-- Safe to rerun: add the column only when it does not already exist.
SET @priority_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tickets'
    AND COLUMN_NAME = 'priority'
);
SET @priority_column_sql = IF(
  @priority_column_exists = 0,
  'ALTER TABLE tickets ADD COLUMN priority ENUM(''HIGH'',''MEDIUM'',''LOW'') NOT NULL DEFAULT ''MEDIUM'' AFTER category',
  'SELECT ''tickets.priority already exists'' AS migration_status'
);
PREPARE priority_column_stmt FROM @priority_column_sql;
EXECUTE priority_column_stmt;
DEALLOCATE PREPARE priority_column_stmt;

-- Add the supporting index only when it does not already exist.
SET @priority_index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'tickets'
    AND INDEX_NAME = 'idx_ticket_priority'
);
SET @priority_index_sql = IF(
  @priority_index_exists = 0,
  'CREATE INDEX idx_ticket_priority ON tickets(priority)',
  'SELECT ''idx_ticket_priority already exists'' AS migration_status'
);
PREPARE priority_index_stmt FROM @priority_index_sql;
EXECUTE priority_index_stmt;
DEALLOCATE PREPARE priority_index_stmt;
