
import api from "./axios";

export const customerApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get("/api/customers", { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/api/customers/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/api/customers", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/api/customers/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/api/customers/${id}`);
    return data;
  }
};
