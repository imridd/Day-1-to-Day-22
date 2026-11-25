
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  Button
} from "@mui/material";
import {
  SendRounded,
  SupportAgentRounded,
  RefreshRounded,
  ChatBubbleOutlineRounded
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { fetchTickets } from "../../features/tickets/ticketSlice";
import api from "../../api/axios";

const getId = value =>
  value?.id ?? value?._id ?? value?.ticketId ?? "";

const getTicketTitle = ticket =>
  ticket?.title ?? ticket?.subject ?? `Ticket #${getId(ticket)}`;

const getMessageText = message =>
  message?.message ?? message?.content ?? message?.text ?? "";

const getSender = message =>
  message?.senderName ??
  message?.sender?.fullName ??
  message?.sender?.name ??
  message?.senderRole ??
  "Support";

export default function CustomerChatPage() {
  const dispatch = useDispatch();

  const { user } = useSelector(state => state.auth);
  const { items = [], loading: ticketsLoading } = useSelector(
    state => state.tickets
  );

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const customerTickets = useMemo(() => {
    const customerId = String(
      user?.id ?? user?.userId ?? user?.customerId ?? ""
    );

    return items.filter(ticket => {
      const ticketCustomerId = String(
        ticket?.customerId ??
        ticket?.customer_id ??
        ticket?.customer?.id ??
        ticket?.customer?._id ??
        ""
      );

      return customerId && ticketCustomerId === customerId;
    });
  }, [items, user]);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  async function loadMessages(ticket) {
    if (!ticket) return;

    const ticketId = getId(ticket);

    if (!ticketId) {
      setError("This ticket does not have a valid ID.");
      return;
    }

    setSelectedTicket(ticket);
    setMessages([]);
    setError("");
    setLoadingMessages(true);

    try {
      // Assumed endpoint: verify against your backend.
      const response = await api.get(
        `/api/tickets/${ticketId}/messages`
      );

      const data = response.data;

      setMessages(
        Array.isArray(data)
          ? data
          : data?.messages ?? data?.data ?? []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ??
        "Unable to load messages. Check the chat API endpoint."
      );
    } finally {
      setLoadingMessages(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();

    const text = messageText.trim();

    if (!text || !selectedTicket || sending) return;

    setSending(true);
    setError("");

    try {
      // Assumed payload: verify against your backend.
      const response = await api.post(
        `/api/tickets/${getId(selectedTicket)}/messages`,
        { message: text }
      );

      const savedMessage =
        response.data?.message ??
        response.data?.data ??
        response.data;

      setMessages(previous => [...previous, savedMessage]);
      setMessageText("");
    } catch (err) {
      setError(
        err.response?.data?.message ??
        "Message could not be sent."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Support Chat 💬
          </Typography>
          <Typography color="text.secondary">
            Get help with your support tickets.
          </Typography>
        </Box>

        <Button
          startIcon={<RefreshRounded />}
          onClick={() => {
            dispatch(fetchTickets());

            if (selectedTicket) {
              loadMessages(selectedTicket);
            }
          }}
          variant="outlined"
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "300px 1fr"
          },
          minHeight: 570,
          border: 1,
          borderColor: "divider",
          borderRadius: 4,
          overflow: "hidden"
        }}
      >
        {/* Ticket list */}
        <Box
          sx={{
            borderRight: { md: 1 },
            borderColor: "divider",
            bgcolor: "background.paper"
          }}
        >
          <Box p={2}>
            <Typography fontWeight={800}>
              Your conversations
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Select a ticket to open its chat.
            </Typography>
          </Box>

          <Divider />

          {ticketsLoading ? (
            <Box p={3} textAlign="center">
              <CircularProgress size={25} />
            </Box>
          ) : customerTickets.length === 0 ? (
            <Box p={3}>
              <Typography color="text.secondary">
                No tickets available.
              </Typography>
            </Box>
          ) : (
            customerTickets.map(ticket => {
              const active =
                String(getId(selectedTicket)) === String(getId(ticket));

              return (
                <Box
                  key={getId(ticket)}
                  onClick={() => loadMessages(ticket)}
                  sx={{
                    p: 2,
                    cursor: "pointer",
                    bgcolor: active
                      ? "action.selected"
                      : "transparent",
                    borderBottom: 1,
                    borderColor: "divider",
                    "&:hover": { bgcolor: "action.hover" }
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography fontWeight={700} noWrap>
                      {getTicketTitle(ticket)}
                    </Typography>

                    <Chip
                      size="small"
                      label={ticket.status ?? "Open"}
                    />
                  </Stack>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Ticket #{getId(ticket)}
                  </Typography>
                </Box>
              );
            })
          )}
        </Box>

        {/* Conversation */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            bgcolor: "background.default"
          }}
        >
          {selectedTicket ? (
            <>
              <Box p={2}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    <SupportAgentRounded />
                  </Avatar>

                  <Box>
                    <Typography fontWeight={800}>
                      {getTicketTitle(selectedTicket)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Support conversation
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Divider />

              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  minHeight: 300,
                  maxHeight: 420,
                  overflowY: "auto"
                }}
              >
                {loadingMessages ? (
                  <Box textAlign="center" py={5}>
                    <CircularProgress />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box textAlign="center" py={6}>
                    <ChatBubbleOutlineRounded
                      sx={{ fontSize: 45, color: "text.secondary" }}
                    />
                    <Typography fontWeight={700} mt={1}>
                      Start the conversation
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      Send a message to the support team.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={2}>
                    {messages.map((message, index) => {
                      const isCustomer =
                        String(
                          message?.senderId ??
                          message?.sender_id ??
                          message?.sender?.id ??
                          ""
                        ) === String(
                          user?.id ?? user?.userId ?? user?.customerId ?? ""
                        );

                      return (
                        <Box
                          key={message.id ?? message.messageId ?? index}
                          sx={{
                            display: "flex",
                            justifyContent: isCustomer
                              ? "flex-end"
                              : "flex-start"
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: "80%",
                              p: 1.5,
                              borderRadius: 3,
                              bgcolor: isCustomer
                                ? "primary.main"
                                : "background.paper",
                              color: isCustomer
                                ? "primary.contrastText"
                                : "text.primary",
                              boxShadow: 1
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{ opacity: 0.75 }}
                            >
                              {isCustomer ? "You" : getSender(message)}
                            </Typography>

                            <Typography sx={{ overflowWrap: "anywhere" }}>
                              {getMessageText(message)}
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                textAlign: "right",
                                opacity: 0.7,
                                mt: 0.5
                              }}
                            >
                              {message.createdAt
                                ? new Date(message.createdAt).toLocaleString()
                                : ""}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              <Divider />

              <Box
                component="form"
                onSubmit={sendMessage}
                sx={{ p: 2 }}
              >
                <Stack direction="row" spacing={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type your message..."
                    value={messageText}
                    onChange={event => setMessageText(event.target.value)}
                    disabled={sending || loadingMessages}
                  />

                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!messageText.trim() || sending}
                    sx={{
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      "&:hover": { bgcolor: "primary.dark" }
                    }}
                  >
                    {sending
                      ? <CircularProgress size={20} color="inherit" />
                      : <SendRounded />}
                  </IconButton>
                </Stack>
              </Box>
            </>
          ) : (
            <Box
              flex={1}
              display="flex"
              alignItems="center"
              justifyContent="center"
              flexDirection="column"
              p={3}
            >
              <ChatBubbleOutlineRounded
                sx={{ fontSize: 65, color: "text.secondary" }}
              />
              <Typography variant="h6" fontWeight={800} mt={2}>
                Pick a conversation
              </Typography>
              <Typography color="text.secondary" textAlign="center">
                Select one of your tickets to chat with support.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
