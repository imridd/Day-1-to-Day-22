
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

// --------------------------------------------------
// SERVER CONFIGURATION
// --------------------------------------------------

class ServerConfig {

  static PORT = Number(process.env.PORT || 4100);

  static DATABASE_NAME =
    process.env.DB_NAME || 'cloudbridge_crm_relational';

  static ALLOWED_ORIGINS = [
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://localhost:5173',
    'http://localhost:5174'
  ];

}

// --------------------------------------------------
// CRM SERVER CLASS
// --------------------------------------------------

class CRMServer {

  constructor() {
    this.app = null;
  }

  async initialize() {

    this.app = await NestFactory.create(AppModule);

    this.configureCors();

    this.configureApi();

  }

  // CORS CONFIGURATION

  configureCors() {

    this.app.enableCors({

      origin: ServerConfig.ALLOWED_ORIGINS,

      methods: [
        'GET',
        'POST',
        'PATCH',
        'DELETE',
        'OPTIONS'
      ],

      allowedHeaders: [
        'Content-Type',
        'x-demo-user'
      ],

      credentials: false

    });

  }

  // API CONFIGURATION

  configureApi() {

    this.app.setGlobalPrefix('api');

    this.app.useBodyParser('json', {
      limit: '1mb'
    });

  }

  // START SERVER

  async start() {

    try {

      await this.initialize();

      await this.app.listen(
        ServerConfig.PORT,
        '127.0.0.1'
      );

      this.displayInfo();

    } catch (error) {

      console.error(
        'Unable to start CRM server:',
        error
      );

      process.exitCode = 1;

    }

  }

  // DISPLAY SERVER INFORMATION

  displayInfo() {

    console.log(`
----------------------------------------
CLOUDBRIDGE CRM - NESTJS
----------------------------------------

Backend:
http://127.0.0.1:${ServerConfig.PORT}

Health:
http://127.0.0.1:${ServerConfig.PORT}/api/health

Accounts:
http://127.0.0.1:${ServerConfig.PORT}/api/accounts

Database:
${ServerConfig.DATABASE_NAME}

Storage:
MySQL Relational Database

----------------------------------------
Server is ready.
----------------------------------------
    `);

  }

}

// --------------------------------------------------
// APPLICATION ENTRY POINT
// --------------------------------------------------

if (process.env.NODE_ENV !== 'test') {

  const server = new CRMServer();

  server.start();

}

export {
  CRMServer,
  ServerConfig
};
