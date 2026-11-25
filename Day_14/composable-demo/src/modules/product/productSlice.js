
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/productService";

// READ
export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { rejectWithValue }) => {
    try {
      return await getProducts();
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// CREATE
export const addProduct = createAsyncThunk(
  "products/addProduct",
  async (productData, { rejectWithValue }) => {
    try {
      return await createProduct(productData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// UPDATE
export const editProduct = createAsyncThunk(
  "products/editProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      return await updateProduct(id, productData);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

// DELETE
export const removeProduct = createAsyncThunk(
  "products/removeProduct",
  async (id, { rejectWithValue }) => {
    try {
      await deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message
      );
    }
  }
);

const initialState = {
  products: [],
  loading: false,
  saving: false,
  error: null,
  mutationError: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder

      // FETCH PRODUCTS
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD PRODUCT
      .addCase(addProduct.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        state.saving = false;
        state.products.push(action.payload);
      })
      .addCase(addProduct.rejected, (state, action) => {
        state.saving = false;
        state.mutationError = action.payload;
      })

      // EDIT PRODUCT
      .addCase(editProduct.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })
      .addCase(editProduct.fulfilled, (state, action) => {
        state.saving = false;

        state.products = state.products.map((product) =>
          product.id === action.payload.id
            ? action.payload
            : product
        );
      })
      .addCase(editProduct.rejected, (state, action) => {
        state.saving = false;
        state.mutationError = action.payload;
      })

      // DELETE PRODUCT
      .addCase(removeProduct.pending, (state) => {
        state.saving = true;
        state.mutationError = null;
      })
      .addCase(removeProduct.fulfilled, (state, action) => {
        state.saving = false;

        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
      })
      .addCase(removeProduct.rejected, (state, action) => {
        state.saving = false;
        state.mutationError = action.payload;
      });
  },
});

export default productSlice.reducer;
