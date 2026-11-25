import 'dotenv/config';
import 'reflect-metadata';

import { NestFactory } from '@nestjs/core';

import AppModule from './modules/app.module.js';

import { env } from './config/env.js';

const app = await NestFactory.create(
  AppModule,
  { cors: false }
);

app.enableCors({
  origin: env(
    'WEB_ORIGIN',
    'http://localhost:5173'
  ).split(','),
  credentials: true
});

app.setGlobalPrefix('');

const port = Number(env('PORT', 3000));

await app.listen(port);

console.log(
  `Helpdesk API listening at http://localhost:${port}/api`
);