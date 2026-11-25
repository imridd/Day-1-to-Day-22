
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../api/authApi";

const savedUser = localStorage.getItem("helpdesk-user");

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: localStorage.getItem("helpdesk-token") || null,
  isAuthenticated: Boolean(localStorage.getItem("helpdesk-token")),
  loading: false,
  error: null
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);

      const token = response.token || response.accessToken;
      const user = response.user || response.data?.user;

      if (!token || !user) {
        return rejectWithValue("Invalid login response from server");
      }

      return { token, user };
    } catch (error) {
      return rejectWithValue(error.message || "Login failed");
    }
  }
);

export const fetchCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authApi.getMe();
      return response.user || response.data?.user || response;
    } catch (error) {
      return rejectWithValue(error.message || "Unable to fetch user");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, user } = action.payload;

      state.token = token;
      state.user = user;
      state.isAuthenticated = true;

      localStorage.setItem("helpdesk-token", token);
      localStorage.setItem("helpdesk-user", JSON.stringify(user));
    },

    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem("helpdesk-user", JSON.stringify(state.user));
    },

    clearAuth: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      localStorage.removeItem("helpdesk-token");
      localStorage.removeItem("helpdesk-user");
    },

    clearAuthError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;

        localStorage.setItem("helpdesk-token", action.payload.token);
        localStorage.setItem(
          "helpdesk-user",
          JSON.stringify(action.payload.user)
        );
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = Boolean(state.token);
        localStorage.setItem(
          "helpdesk-user",
          JSON.stringify(action.payload)
        );
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem("helpdesk-token");
        localStorage.removeItem("helpdesk-user");
      });
  }
});

export const {
  setCredentials,
  updateUser,
  clearAuth,
  clearAuthError
} = authSlice.actions;

export default authSlice.reducer;
