
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationApi } from "../../api/notificationApi";

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      return await notificationApi.getAll();
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to load notifications"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",

  initialState: {
    items: [],
    loading: false,
    error: null
  },

  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
    },

    markNotificationRead: (state, action) => {
      state.items = state.items.map((item) =>
        (item.notificationId ?? item.id) === action.payload
          ? { ...item, isRead: true }
          : item
      );
    },

    markAllNotificationsRead: (state) => {
      state.items = state.items.map((item) => ({
        ...item,
        isRead: true
      }));
    },

    clearNotifications: (state) => {
      state.items = [];
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;

        const response = action.payload;
        state.items = Array.isArray(response)
          ? response
          : response.notifications || response.data || [];
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  addNotification,
  markNotificationRead,
  markAllNotificationsRead,
  clearNotifications
} = notificationSlice.actions;

export default notificationSlice.reducer;
