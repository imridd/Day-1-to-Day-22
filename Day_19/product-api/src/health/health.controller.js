
const {
  Controller,
  Get,
  Inject
} = require('@nestjs/common');

const HealthService = require('./health.service');

class HealthController {

  constructor(healthService) {
    this.healthService = healthService;
  }

  check() {
    return this.healthService.check();
  }

}

Inject(HealthService)(HealthController, undefined, 0);

Controller('health')(HealthController);

Get()(
  HealthController.prototype,
  'check',
  Object.getOwnPropertyDescriptor(HealthController.prototype, 'check')
);

module.exports = HealthController;
