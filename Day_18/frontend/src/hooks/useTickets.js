
import { useAppDispatch, useAppSelector } from "./reduxHooks";

import {
  fetchTickets,
  addTicket,
  updateTicket,
  removeTicket,
  selectTicket,
  clearSelectedTicket,
  clearTicketError
} from "../features/tickets/ticketSlice";

export default function useTickets() {
  const dispatch = useAppDispatch();

  const ticketState = useAppSelector((state) => state.tickets);

  const loadTickets = (params) => {
    return dispatch(fetchTickets(params));
  };

  const createTicket = (ticket) => {
    dispatch(addTicket(ticket));
  };

  const editTicket = (ticket) => {
    dispatch(updateTicket(ticket));
  };

  const deleteTicket = (id) => {
    dispatch(removeTicket(id));
  };

  const openTicket = (ticket) => {
    dispatch(selectTicket(ticket));
  };

  const closeTicketDetails = () => {
    dispatch(clearSelectedTicket());
  };

  return {
    tickets: ticketState.items,
    selectedTicket: ticketState.selectedTicket,
    loading: ticketState.loading,
    error: ticketState.error,
    loadTickets,
    createTicket,
    editTicket,
    deleteTicket,
    openTicket,
    closeTicketDetails,
    clearError: () => dispatch(clearTicketError())
  };
}
