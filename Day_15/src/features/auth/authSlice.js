import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginRequest } from "../../services/authService";
export const login = createAsyncThunk("auth/login", loginRequest);
const authSlice = createSlice({
  name: "auth",
  initialState: { admin: null, status: "idle", error: null },
  reducers: {
    logout: (s) => {
      s.admin = null;
    },
  },
  extraReducers: (b) =>
    b
      .addCase(login.pending, (s) => {
        s.status = "loading";
        s.error = null;
      })
      .addCase(login.fulfilled, (s, a) => {
        s.status = "succeeded";
        s.admin = a.payload;
      })
      .addCase(login.rejected, (s, a) => {
        s.status = "failed";
        s.error = a.error.message;
      }),
});
export const { logout } = authSlice.actions;
export default authSlice.reducer;
