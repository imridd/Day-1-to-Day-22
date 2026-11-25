const { Module } = require('@nestjs/common');
const HealthController = require('./health.controller');
const HealthService = require('./health.service');
const DatabaseModule = require('../config/database.module');
class HealthModule {}
Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
  providers: [HealthService]
})(HealthModule);

module.exports = HealthModule;
