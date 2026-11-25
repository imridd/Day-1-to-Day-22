
import api from "./axios";

export const agentApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get("/api/agents", { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/api/agents/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/api/agents", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/api/agents/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/api/agents/${id}`);
    return data;
  }
};
