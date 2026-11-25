
import api from "./axios";

export const authApi = {
  login: async (credentials) => {
    const { data } = await api.post("/api/auth/login", credentials);
    return data;
  },

  getMe: async () => {
    const { data } = await api.get("/api/auth/me");
    return data;
  },

  logout: async () => {
    const { data } = await api.post("/api/auth/logout");
    return data;
  }
};
