
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:3000",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("helpdesk-token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const isLoginRequest = error.config?.url?.includes("/api/auth/login");

      if (!isLoginRequest) {
        localStorage.removeItem("helpdesk-token");
        localStorage.removeItem("helpdesk-user");
      }
    }

    return Promise.reject(
      error.response?.data || {
        message: error.message || "Something went wrong"
      }
    );
  }
);

export default api;
