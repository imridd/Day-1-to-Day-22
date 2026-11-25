
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  messages: [],
  selectedConversation: null,
  loading: false,
  error: null
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setConversations(state, action) {
      state.conversations = action.payload || [];
    },

    setMessages(state, action) {
      state.messages = action.payload || [];
    },

    addMessage(state, action) {
      const message = action.payload;

      const messageId = message.messageId ?? message.id;

      const exists = state.messages.some(
        (item) =>
          (item.messageId ?? item.id) === messageId &&
          messageId != null
      );

      if (!exists) {
        state.messages.push(message);
      }
    },

    updateMessage(state, action) {
      const updated = action.payload;
      const id = updated.messageId ?? updated.id;

      state.messages = state.messages.map((message) => {
        const currentId = message.messageId ?? message.id;

        return currentId === id
          ? { ...message, ...updated }
          : message;
      });
    },

    selectConversation(state, action) {
      state.selectedConversation = action.payload;
      state.messages = [];
      state.error = null;
    },

    clearConversation(state) {
      state.selectedConversation = null;
      state.messages = [];
    },

    setChatLoading(state, action) {
      state.loading = Boolean(action.payload);
    },

    setChatError(state, action) {
      state.error = action.payload;
    },

    clearChat(state) {
      state.conversations = [];
      state.messages = [];
      state.selectedConversation = null;
      state.loading = false;
      state.error = null;
    }
  }
});

export const {
  setConversations,
  setMessages,
  addMessage,
  updateMessage,
  selectConversation,
  clearConversation,
  setChatLoading,
  setChatError,
  clearChat
} = chatSlice.actions;

export default chatSlice.reducer;
