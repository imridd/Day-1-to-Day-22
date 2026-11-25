import { Module } from '@nestjs/common';

import pool from '../config/database.js';

import { HelpdeskService } from '../services/helpdesk.service.js';
import { HelpdeskController } from '../controllers/helpdesk.controller.js';

import '../routes/helpdesk.routes.js';

class AppModule {}

Module({
  controllers: [HelpdeskController],
  providers: [
    {
      provide: 'DB',
      useValue: pool
    },
    HelpdeskService
  ]
})(AppModule);

export default AppModule;