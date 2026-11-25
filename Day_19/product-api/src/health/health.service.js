
const {
  Injectable,
  Inject
} = require('@nestjs/common');

class HealthService {

  constructor(pool) {
    this.pool = pool;
  }

  async check() {

    await this.pool.query('SELECT 1');

    return {
      status: 'ok',
      database: 'connected'
    };

  }

}

Inject('DB_POOL')(HealthService, undefined, 0);

Injectable()(HealthService);

module.exports = HealthService;
