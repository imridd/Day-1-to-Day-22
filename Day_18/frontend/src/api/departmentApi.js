
import api from "./axios";

export const departmentApi = {
  getAll: async () => {
    const { data } = await api.get("/api/departments");
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/api/departments/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/api/departments", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/api/departments/${id}`, payload);
    return data;
  },

  remove: async (id) => {
    const { data } = await api.delete(`/api/departments/${id}`);
    return data;
  }
};
