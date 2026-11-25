
const {
  BadRequestException
} = require('@nestjs/common');

class ProductValidator {

  static validateProduct(data = {}) {

    const sku =
      typeof data.sku === 'string'
        ? data.sku.trim().toUpperCase()
        : '';

    const name =
      typeof data.name === 'string'
        ? data.name.trim()
        : '';

    const price = String(data.price ?? '');

    const stock = data.stock;

    if (!/^[A-Z0-9_-]{3,32}$/.test(sku)) {
      throw new BadRequestException('Invalid SKU');
    }

    if (name.length < 2 || name.length > 100) {
      throw new BadRequestException('Invalid Product Name');
    }

    if (!/^(?:0|[1-9]\d{0,7})(?:\.\d{1,2})?$/.test(price)) {
      throw new BadRequestException('Invalid Price');
    }

    if (
      !Number.isInteger(stock) ||
      stock < 0 ||
      stock > 4294967295
    ) {
      throw new BadRequestException('Invalid Stock');
    }

    return {
      sku,
      name,
      price,
      stock
    };

  }

  static parseId(value) {

    const id = Number(value);

    if (
      !Number.isSafeInteger(id) ||
      id < 1 ||
      id > 4294967295
    ) {
      throw new BadRequestException('Invalid Product ID');
    }

    return id;
  }

}

module.exports = ProductValidator;
