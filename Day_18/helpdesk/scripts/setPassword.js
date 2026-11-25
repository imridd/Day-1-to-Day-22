
import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

import pool from '../config/database.js';
import { hashPassword } from '../utils/password.js';

const [accountType, rawEmail] = process.argv.slice(2);

const allowedTypes = {
  agent: 'agents',
  customer: 'customers'
};

async function main() {
  if (!allowedTypes[accountType] || !rawEmail) {
    throw new Error(
      'Usage: node scripts/set-password.js agent|customer email'
    );
  }

  const email = rawEmail.trim().toLowerCase();
  const table = allowedTypes[accountType];

  const [rows] = await pool.execute(
    `SELECT ${accountType === 'agent' ? 'agent_id' : 'customer_id'} AS id
     FROM ${table}
     WHERE email = ?`,
    [email]
  );

  if (rows.length === 0) {
    throw new Error('Account not found. Check the email address.');
  }

  const terminal = createInterface({ input: stdin, output: stdout });

  try {
    const password = await terminal.question(
      'Enter a new password (minimum 8 characters): '
    );

    const confirmPassword = await terminal.question(
      'Confirm the password: '
    );

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match.');
    }

    const { password_hash, password_salt } =
      await hashPassword(password);

    await pool.execute(
      `UPDATE ${table}
       SET password_hash = ?, password_salt = ?
       WHERE email = ?`,
      [password_hash, password_salt, email]
    );

    console.log(`Password successfully set for ${accountType}.`);
  } finally {
    terminal.close();
  }
}

try {
  await main();
} catch (error) {
  console.error('Password setup failed:', error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
