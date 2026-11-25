import axios from 'axios';

export const TOKEN_KEY = 'helpdesk_token';

// The interceptor reads only the in-memory token. AuthContext controls its lifetime.
let accessToken = null;

export const setAccessToken = (token) => { accessToken = token || null; };
export const clearAccessToken = () => { accessToken = null; };
export const getAccessToken = () => accessToken;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    const isLogin = url.includes('/auth/login');
    const isLogout = url.includes('/auth/logout');

    if (error.response?.status === 401 && !isLogin && !isLogout) {
      clearAccessToken();
      sessionStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== '/login') window.location.assign('/login');
    }
    return Promise.reject(error);
  }
);

export const apiError = (error) =>
  error.response?.data?.message ||
  (error.code === 'ERR_NETWORK' ? 'Cannot reach the server' : error.message);

export default api;
