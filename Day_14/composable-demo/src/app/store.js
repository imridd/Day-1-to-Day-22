
import { configureStore } from "@reduxjs/toolkit";

import employeeReducer from "../modules/employee/employeeSlice";
import productReducer from "../modules/product/productSlice";
import courseReducer from "../modules/course/courseSlice";

export const store = configureStore({
  reducer: {
    employees: employeeReducer,
    products: productReducer,
    courses: courseReducer,
  },
});
