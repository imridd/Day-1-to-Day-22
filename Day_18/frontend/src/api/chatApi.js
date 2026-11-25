
import api from "./axios";

export const chatApi = {
  getTicketMessages: async (ticketId) => {
    const { data } = await api.get(
      `/api/tickets/${ticketId}/messages`
    );
    return data;
  },

  getGlobalMessages: async () => {
    const { data } = await api.get("/api/messages");
    return data;
  },

  getPrivateMessages: async (userId) => {
    const { data } = await api.get(`/api/messages/private/${userId}`);
    return data;
  }
};
