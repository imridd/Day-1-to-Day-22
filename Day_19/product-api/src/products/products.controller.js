
const {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Inject
} = require('@nestjs/common');

const ProductsService = require('./products.service');

class ProductsController {

  constructor(productsService) {
    this.productsService = productsService;
  }

  // GET /api/products
  findAll() {
    return this.productsService.findAll();
  }

  // GET /api/products/:id
  findOne(id) {
    return this.productsService.findOne(id);
  }

  // POST /api/products
  create(data) {
    return this.productsService.create(data);
  }

  // PUT /api/products/:id
  update(id, data) {
    return this.productsService.update(id, data);
  }

  // DELETE /api/products/:id
  remove(id) {
    return this.productsService.remove(id);
  }

}

Inject(ProductsService)(ProductsController, undefined, 0);

Controller('api/products')(ProductsController);

Get()(
  ProductsController.prototype,
  'findAll',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'findAll')
);

Get(':id')(
  ProductsController.prototype,
  'findOne',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'findOne')
);

Param('id')(ProductsController.prototype, 'findOne', 0);

Post()(
  ProductsController.prototype,
  'create',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'create')
);

Body()(ProductsController.prototype, 'create', 0);

Put(':id')(
  ProductsController.prototype,
  'update',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'update')
);

Param('id')(ProductsController.prototype, 'update', 0);
Body()(ProductsController.prototype, 'update', 1);

Delete(':id')(
  ProductsController.prototype,
  'remove',
  Object.getOwnPropertyDescriptor(ProductsController.prototype, 'remove')
);

Param('id')(ProductsController.prototype, 'remove', 0);

module.exports = ProductsController;
