
import { Module } from '@nestjs/common';

import { CRMController } from './crm.controller.js';
import { CRMService } from './engine.mjs';

class AppModule {}

Module({
  imports: [],
  controllers: [
    CRMController
  ],
  providers: [
    CRMService
  ]
})(AppModule);

export { AppModule };
