
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { ticketApi } from "../../api/ticketApi";

export const fetchTickets = createAsyncThunk(
  "tickets/fetchAll",
  async (params, { rejectWithValue }) => {
    try {
      return await ticketApi.getAll(params);
    } catch (error) {
      return rejectWithValue(error.message || "Unable to load tickets");
    }
  }
);

const ticketSlice = createSlice({
  name: "tickets",

  initialState: {
    items: [],
    selectedTicket: null,
    loading: false,
    error: null
  },

  reducers: {
    setTickets: (state, action) => {
      state.items = action.payload;
    },

    addTicket: (state, action) => {
      state.items.unshift(action.payload);
    },

    updateTicket: (state, action) => {
      const updated = action.payload;
      const id = updated.ticketId ?? updated.id;

      state.items = state.items.map((ticket) => {
        const ticketId = ticket.ticketId ?? ticket.id;
        return ticketId === id ? { ...ticket, ...updated } : ticket;
      });

      if (
        state.selectedTicket &&
        (state.selectedTicket.ticketId ?? state.selectedTicket.id) === id
      ) {
        state.selectedTicket = {
          ...state.selectedTicket,
          ...updated
        };
      }
    },

    removeTicket: (state, action) => {
      state.items = state.items.filter(
        (ticket) =>
          (ticket.ticketId ?? ticket.id) !== action.payload
      );
    },

    selectTicket: (state, action) => {
      state.selectedTicket = action.payload;
    },

    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
    },

    clearTicketError: (state) => {
      state.error = null;
    }
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;

        const response = action.payload;
        state.items = Array.isArray(response)
          ? response
          : response.tickets || response.data || [];
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setTickets,
  addTicket,
  updateTicket,
  removeTicket,
  selectTicket,
  clearSelectedTicket,
  clearTicketError
} = ticketSlice.actions;

export default ticketSlice.reducer;
