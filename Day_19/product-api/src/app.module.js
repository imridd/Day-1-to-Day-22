
const { Module } = require('@nestjs/common');

const DatabaseModule = require('./config/database.module');
const ProductsModule = require('./products/products.module');
const HealthModule = require('./health/health.module');

class AppModule {}

Module({
  imports: [
    DatabaseModule,
    ProductsModule,
    HealthModule
  ]
})(AppModule);

module.exports = AppModule;
