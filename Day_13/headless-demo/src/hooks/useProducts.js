import {
 useDispatch,
 useSelector
}
from "react-redux";

import {
 fetchProducts,
 createProduct,
 editProduct,
 removeProduct
}
from "../redux/product/productThunk";

export const useProducts =
()=>{

 const dispatch =
 useDispatch();

 const {
  products,
  loading
 } = useSelector(
  state =>
  state.products
 );

 return {

  products,

  loading,

  fetchProducts:()=>{
   dispatch(
    fetchProducts()
   );
  },

  createProduct:(data)=>{
   dispatch(
    createProduct(data)
   );
  },

  editProduct:(id,data)=>{
   dispatch(
    editProduct({
      id,
      product:data
    })
   );
  },

  deleteProduct:(id)=>{
   dispatch(
    removeProduct(id)
   );
  }

 };
};
