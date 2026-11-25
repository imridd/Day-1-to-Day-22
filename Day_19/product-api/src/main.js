
require('dotenv').config();
require('reflect-metadata');

const express = require('express');

const { NestFactory } = require('@nestjs/core');

const AppModule = require('./app.module');

const Database = require('./config/database');

const HttpExceptionFilter = require('./common/filters/http-exception.filter');

class Application {

  constructor() {
    this.port = Number(process.env.API_PORT) || 3000;
    this.allowedOrigins = (
      process.env.CORS_ORIGINS || ''
    )
      .split(',')
      .map(origin => origin.trim())
      .filter(Boolean);
  }

  validatePort() {

    if (
      !Number.isInteger(this.port) ||
      this.port < 1 ||
      this.port > 65535
    ) {
      throw new Error('Invalid Port');
    }

  }

  configureMiddleware(app) {

    app.use(express.json({
      limit: '64kb'
    }));

    app.enableCors({
      origin: (origin, callback) => {

        if (
          !origin ||
          this.allowedOrigins.includes(origin)
        ) {
          return callback(null, true);
        }

        const error = new Error('Origin not allowed');
        error.status = 403;

        callback(error);
      }
    });

  }

  async start() {

    this.validatePort();

    try {

      await Database.testConnection();

      console.log('MYSQL Connected Successfully');

      const app = await NestFactory.create(AppModule, {
        bodyParser: false
      });

      this.configureMiddleware(app);

      app.useGlobalFilters(
        new HttpExceptionFilter()
      );

      await app.listen(this.port);

      console.log(
        `NestJS MYSQL API running at http://localhost:${this.port}`
      );

    } catch (error) {

      console.error(
        'Application startup failed:',
        error.message
      );

      await Database.closeConnection();

      process.exitCode = 1;

    }

  }

}

const application = new Application();

application.start();
