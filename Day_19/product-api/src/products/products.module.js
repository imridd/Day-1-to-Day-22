
const { Module } = require('@nestjs/common');

const ProductsController = require('./products.controller');
const ProductsService = require('./products.service');
const DatabaseModule = require('../config/database.module');

class ProductsModule {}

Module({
  imports: [DatabaseModule],
  controllers: [ProductsController],
  providers: [ProductsService]
})(ProductsModule);

module.exports = ProductsModule;
