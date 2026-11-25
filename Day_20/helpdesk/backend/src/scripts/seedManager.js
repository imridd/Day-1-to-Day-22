import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

const name = process.env.MANAGER_NAME || 'Super Manager';
const email = (process.env.MANAGER_EMAIL || 'manager@example.com').toLowerCase();
const password = process.env.MANAGER_PASSWORD || 'Manager@12345';

const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
if (rows[0]) {
  console.log(`Manager ${email} already exists.`);
} else {
  const hash = await bcrypt.hash(password, 12);
  await pool.execute(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'MANAGER')",
    [name, email, hash]
  );
  console.log(`Manager created: ${email}`);
}
await pool.end();
