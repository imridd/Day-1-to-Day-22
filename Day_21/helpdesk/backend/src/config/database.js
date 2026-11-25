import { createPool } from 'mysql2/promise';
import { env } from './env.js';

const pool = createPool({
  host: env('DB_HOST', '127.0.0.1'),
  port: Number(env('DB_PORT', 3306)),
  user: env('DB_USER', 'root'),
  password: env('DB_PASSWORD', ''),
  database: env('DB_NAME', 'helpdesk'),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
  timezone: 'Z'
});

export default pool;