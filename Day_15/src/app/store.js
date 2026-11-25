import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import pageReducer from "../features/pages/pageSlice";
import navigationReducer from "../features/navigation/navigationSlice";
export const store = configureStore({
  reducer: {
    auth: authReducer,
    pages: pageReducer,
    navigation: navigationReducer,
  },
});
