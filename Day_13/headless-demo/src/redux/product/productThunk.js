
import { createAsyncThunk }
from "@reduxjs/toolkit";

import * as productService
from "../../services/productService";

export const fetchProducts =
createAsyncThunk(
  "products/fetchProducts",
  async () =>
    await productService.getProducts()
);

export const createProduct =
createAsyncThunk(
  "products/createProduct",
  async (product) =>
    await productService.addProduct(product)
);

export const editProduct =
createAsyncThunk(
  "products/editProduct",
  async ({id, product}) =>
    await productService.updateProduct(
      id,
      product
    )
);

export const removeProduct =
createAsyncThunk(
  "products/removeProduct",
  async (id) =>
    await productService.deleteProduct(id)
);

