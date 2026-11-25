
import api from "./axios";

export const ticketApi = {
  getAll: async (params = {}) => {
    const { data } = await api.get("/api/tickets", { params });
    return data;
  },

  getById: async (id) => {
    const { data } = await api.get(`/api/tickets/${id}`);
    return data;
  },

  create: async (payload) => {
    const { data } = await api.post("/api/tickets", payload);
    return data;
  },

  update: async (id, payload) => {
    const { data } = await api.put(`/api/tickets/${id}`, payload);
    return data;
  },

  assign: async (id, payload) => {
    const { data } = await api.patch(`/api/tickets/${id}/assign`, payload);
    return data;
  },

  claim: async (id) => {
    const { data } = await api.post(`/api/tickets/${id}/claim`);
    return data;
  },

  getHistory: async (id) => {
    const { data } = await api.get(`/api/tickets/${id}/history`);
    return data;
  },

  getMessages: async (id) => {
    const { data } = await api.get(`/api/tickets/${id}/messages`);
    return data;
  },

  sendMessage: async (id, payload) => {
    const { data } = await api.post(`/api/tickets/${id}/messages`, payload);
    return data;
  },

  close: async (id) => {
    const { data } = await api.patch(`/api/tickets/${id}/close`);
    return data;
  },

  reopen: async (id) => {
    const { data } = await api.patch(`/api/tickets/${id}/reopen`);
    return data;
  }
};
