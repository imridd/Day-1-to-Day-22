
import { createAsyncThunk } from "@reduxjs/toolkit";

import * as employeeService from "../../services/employeeService";

export const fetchEmployees =
  createAsyncThunk(
    "employees/fetchEmployees",
    async () => {
      return await employeeService.getEmployees();
    }
  );

export const createEmployee =
  createAsyncThunk(
    "employees/createEmployee",
    async (employee) => {
      return await employeeService.addEmployee(
        employee
      );
    }
  );

export const editEmployee =
  createAsyncThunk(
    "employees/editEmployee",
    async ({ id, employee }) => {
      return await employeeService.updateEmployee(
        id,
        employee
      );
    }
  );

export const removeEmployee =
  createAsyncThunk(
    "employees/removeEmployee",
    async (id) => {
      return await employeeService.deleteEmployee(id);
    }
  );