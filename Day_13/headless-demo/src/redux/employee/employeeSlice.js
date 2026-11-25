
import { createSlice } from "@reduxjs/toolkit";

import {
  fetchEmployees,
  createEmployee,
  editEmployee,
  removeEmployee
} from "./employeeThunk";

const initialState = {
  employees: [],
  loading: false,
  error: null
};

const employeeSlice = createSlice({
  name: "employees",
  initialState,

  reducers: {},

  extraReducers: (builder) => {

    builder

      .addCase(
        fetchEmployees.pending,
        (state) => {
          state.loading = true;
        }
      )

      .addCase(
        fetchEmployees.fulfilled,
        (state, action) => {
          state.loading = false;
          state.employees = action.payload;
        }
      )

      .addCase(
        createEmployee.fulfilled,
        (state, action) => {
          state.employees.push(
            action.payload
          );
        }
      )

      .addCase(
        editEmployee.fulfilled,
        (state, action) => {

          const index =
            state.employees.findIndex(
              (emp) =>
                emp.id === action.payload.id
            );

          if(index !== -1){
            state.employees[index] =
              action.payload;
          }
        }
      )

      .addCase(
        removeEmployee.fulfilled,
        (state, action) => {

          state.employees =
            state.employees.filter(
              (emp) =>
                emp.id !== action.payload
            );
        }
      );
  }
});

export default employeeSlice.reducer;