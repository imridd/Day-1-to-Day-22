
import { useAppDispatch, useAppSelector } from "./reduxHooks";

import {
  loginUser,
  fetchCurrentUser,
  clearAuth,
  clearAuthError
} from "../features/auth/authSlice";

export default function useAuth() {
  const dispatch = useAppDispatch();

  const auth = useAppSelector((state) => state.auth);

  const login = (credentials) => {
    return dispatch(loginUser(credentials));
  };

  const refreshUser = () => {
    return dispatch(fetchCurrentUser());
  };

  const logout = () => {
    dispatch(clearAuth());
  };

  const clearError = () => {
    dispatch(clearAuthError());
  };

  return {
    user: auth.user,
    token: auth.token,
    isAuthenticated: Boolean(auth.token),
    loading: auth.loading,
    error: auth.error,
    login,
    logout,
    refreshUser,
    clearError
  };
}
