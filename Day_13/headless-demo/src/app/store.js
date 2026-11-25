import { configureStore } from "@reduxjs/toolkit";

import employeeReducer from "../redux/employee/employeeSlice";
import productReducer from "../redux/product/productSlice";
import courseReducer from "../redux/course/courseSlice";

export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    products: productReducer,
    courses: courseReducer,
  },
});