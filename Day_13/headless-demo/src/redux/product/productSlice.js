
import {
 createSlice
}
from "@reduxjs/toolkit";

import {
 fetchProducts,
 createProduct,
 editProduct,
 removeProduct
}
from "./productThunk";

const initialState = {
 products: [],
 loading: false,
 error: null
};

const productSlice =
createSlice({

 name:"products",

 initialState,

 reducers:{},

 extraReducers:(builder)=>{

 builder

 .addCase(
  fetchProducts.pending,
  (state)=>{
   state.loading=true;
  }
 )

 .addCase(
  fetchProducts.fulfilled,
  (state,action)=>{
   state.loading=false;
   state.products=action.payload;
  }
 )

 .addCase(
  createProduct.fulfilled,
  (state,action)=>{
   state.products.push(
     action.payload
   );
  }
 )

 .addCase(
  editProduct.fulfilled,
  (state,action)=>{

   const index =
   state.products.findIndex(
    product =>
    product.id ===
    action.payload.id
   );

   if(index !== -1){
    state.products[index]
      = action.payload;
   }
  }
 )

 .addCase(
  removeProduct.fulfilled,
  (state,action)=>{
   state.products=
   state.products.filter(
    product =>
    product.id !== action.payload
   );
  }
 );
 }
});

export default productSlice.reducer;