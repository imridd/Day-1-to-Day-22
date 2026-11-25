
import 'dotenv/config';

import mysql from 'mysql2/promise';

import {
  Injectable
} from '@nestjs/common';

// ==================================================
// DATABASE CONFIGURATION
// ==================================================

class DatabaseConfig {

  constructor() {
    this.host = process.env.DB_HOST || '127.0.0.1';

    this.port = Number(
      process.env.DB_PORT || 3306
    );

    this.user = process.env.DB_USER || 'root';

    this.password = process.env.DB_PASSWORD || '';

    this.database =
      process.env.DB_NAME || 'cloudbridge_crm_relational';

    this.waitForConnections = true;

    this.connectionLimit = 10;

    this.queueLimit = 0;

    this.dateStrings = true;
  }

}

// ==================================================
// DATABASE SERVICE
// ==================================================

class DatabaseService {

  constructor() {
    this.config = new DatabaseConfig();

    this.pool = null;
  }

  // ----------------------------------------------
  // CREATE MYSQL CONNECTION POOL
  // ----------------------------------------------

  getPool() {
    if (!this.pool) {
      this.pool = mysql.createPool(this.config);

      console.log('MySQL connection pool created.');
    }

    return this.pool;
  }

  // ----------------------------------------------
  // EXECUTE SQL QUERY
  // ----------------------------------------------

  async query(sql, params = []) {
    const pool = this.getPool();

    const [rows] = await pool.execute(
      sql,
      params
    );

    return rows;
  }

  // ----------------------------------------------
  // TRANSACTION
  // ----------------------------------------------

  async withTransaction(work) {
    const pool = this.getPool();

    const connection = await pool.getConnection();

    let transactionStarted = false;

    try {
      await connection.beginTransaction();

      transactionStarted = true;

      const transaction = {

        query: async (sql, params = []) => {
          const [rows] = await connection.execute(
            sql,
            params
          );

          return rows;
        }

      };

      const result = await work(transaction);

      await connection.commit();

      transactionStarted = false;

      return result;

    } catch (error) {

      if (transactionStarted) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error(
            'Transaction rollback failed:',
            rollbackError.message
          );
        }
      }

      throw error;

    } finally {
      connection.release();
    }
  }

  // ----------------------------------------------
  // CHECK DATABASE CONNECTION
  // ----------------------------------------------

  async pingDatabase() {
    const pool = this.getPool();

    await pool.query('SELECT 1');

    return true;
  }

  // ----------------------------------------------
  // CLOSE DATABASE CONNECTION
  // ----------------------------------------------

  async closeDatabase() {
    if (this.pool) {
      await this.pool.end();

      this.pool = null;

      console.log('MySQL connection pool closed.');
    }
  }

  // ----------------------------------------------
  // NESTJS LIFECYCLE
  // ----------------------------------------------

  async onModuleDestroy() {
    await this.closeDatabase();
  }

}

// ==================================================
// NESTJS DECORATOR REGISTRATION
// ==================================================

Injectable()(DatabaseService);

// ==================================================
// SHARED DATABASE INSTANCE
// ==================================================

const databaseService = new DatabaseService();

// ==================================================
// BACKWARD-COMPATIBLE NAMED EXPORTS
// ==================================================

export async function query(sql, params = []) {
  return databaseService.query(sql, params);
}

export async function withTransaction(work) {
  return databaseService.withTransaction(work);
}

export async function pingDatabase() {
  return databaseService.pingDatabase();
}

export async function closeDatabase() {
  return databaseService.closeDatabase();
}

// ==================================================
// CLASS EXPORTS
// ==================================================

export {
  DatabaseConfig,
  DatabaseService,
  databaseService
};
