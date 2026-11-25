
import { configureStore } from "@reduxjs/toolkit";

import authReducer from "../features/auth/authSlice";
import ticketReducer from "../features/tickets/ticketSlice";
import notificationReducer from "../features/notifications/notificationSlice";
import chatReducer from "../features/chat/chatSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tickets: ticketReducer,
    notifications: notificationReducer,
    chat: chatReducer,
  },
});
