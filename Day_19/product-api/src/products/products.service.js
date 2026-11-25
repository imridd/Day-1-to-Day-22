
const {
  Injectable,
  Inject,
  NotFoundException
} = require('@nestjs/common');

const ProductValidator = require('./product.validator');

class ProductsService {

  constructor(pool) {
    this.pool = pool;
  }

  // GET ALL PRODUCTS
  async findAll() {

    const [products] = await this.pool.execute(
      'SELECT * FROM products ORDER BY id DESC'
    );

    return products;
  }

  // GET PRODUCT BY ID
  async findOne(value) {

    const id = ProductValidator.parseId(value);

    const [rows] = await this.pool.execute(
      'SELECT * FROM products WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return rows[0];
  }

  // CREATE PRODUCT
  async create(data) {

    const {
      sku,
      name,
      price,
      stock
    } = ProductValidator.validateProduct(data);

    const [result] = await this.pool.execute(
      `INSERT INTO products
       (sku, name, price, stock)
       VALUES (?, ?, ?, ?)`,
      [sku, name, price, stock]
    );

    return {
      message: 'Product Created Successfully',
      id: result.insertId
    };
  }

  // UPDATE PRODUCT
  async update(value, data) {

    const id = ProductValidator.parseId(value);

    const {
      sku,
      name,
      price,
      stock
    } = ProductValidator.validateProduct(data);

    const [result] = await this.pool.execute(
      `UPDATE products
       SET sku = ?, name = ?, price = ?, stock = ?
       WHERE id = ?`,
      [sku, name, price, stock, id]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product Updated Successfully'
    };
  }

  // DELETE PRODUCT
  async remove(value) {

    const id = ProductValidator.parseId(value);

    const [result] = await this.pool.execute(
      'DELETE FROM products WHERE id = ?',
      [id]
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Product not found');
    }

    return {
      message: 'Product Deleted Successfully'
    };
  }

}

Inject('DB_POOL')(ProductsService, undefined, 0);

Injectable()(ProductsService);

module.exports = ProductsService;
