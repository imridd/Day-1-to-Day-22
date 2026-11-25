
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import {
  getEmployees,
  createEmployee as createEmployeeAPI,
  updateEmployee as updateEmployeeAPI,
  deleteEmployee as deleteEmployeeAPI
} from "../../services/employeeService";

// FETCH EMPLOYEES
export const fetchEmployees = createAsyncThunk(
  "employees/fetchEmployees",
  async (_, { rejectWithValue }) => {
    try {
      return await getEmployees();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// ADD EMPLOYEE
export const addEmployee = createAsyncThunk(
  "employees/addEmployee",
  async (employeeData, { rejectWithValue }) => {
    try {
      return await createEmployeeAPI(employeeData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// UPDATE EMPLOYEE
export const editEmployee = createAsyncThunk(
  "employees/editEmployee",
  async ({ id, employeeData }, { rejectWithValue }) => {
    try {
      return await updateEmployeeAPI(id, employeeData);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// DELETE EMPLOYEE
export const removeEmployee = createAsyncThunk(
  "employees/removeEmployee",
  async (id, { rejectWithValue }) => {
    try {
      await deleteEmployeeAPI(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

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

      // FETCH
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ADD
      .addCase(addEmployee.fulfilled, (state, action) => {
        state.employees.push(action.payload);
      })
      .addCase(addEmployee.rejected, (state, action) => {
        state.error = action.payload;
      })

      // UPDATE
      .addCase(editEmployee.fulfilled, (state, action) => {
        const index = state.employees.findIndex(
          (employee) => employee.id === action.payload.id
        );

        if (index !== -1) {
          state.employees[index] = action.payload;
        }
      })
      .addCase(editEmployee.rejected, (state, action) => {
        state.error = action.payload;
      })

      // DELETE
      .addCase(removeEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter(
          (employee) => employee.id !== action.payload
        );
      })
      .addCase(removeEmployee.rejected, (state, action) => {
        state.error = action.payload;
      });
  }
});

export default employeeSlice.reducer;
