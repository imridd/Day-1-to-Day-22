
import api from "./axios";

export const notificationApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get("/api/notifications", { params });
    return data;
  },

  markRead: async (id) => {
    const { data } = await api.patch(`/api/notifications/${id}/read`);
    return data;
  },

  markAllRead: async () => {
    const { data } = await api.patch("/api/notifications/read-all");
    return data;
  }
};
