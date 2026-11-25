
const mysql = require('mysql2/promise');

class Database {

  constructor() {

    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,

      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

  }

  getPool() {
    return this.pool;
  }

  async testConnection() {
    await this.pool.query('SELECT 1');
    return true;
  }

  async closeConnection() {
    await this.pool.end();
  }

}

module.exports = new Database();
