
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  SearchRounded,
  SendRounded,
  RefreshRounded,
  ChatBubbleOutlineRounded
} from "@mui/icons-material";

import api from "../../api/axios";
import { useAppSelector } from "../../hooks/reduxHooks";

function getAgentId(agent) {
  return agent.agentId ?? agent.agent_id ?? agent.id;
}

function getAgentName(agent) {
  return agent.fullName ?? agent.full_name ?? agent.name ?? "Agent";
}

function getMessageId(message, index) {
  return message.messageId ?? message.message_id ?? message.id ?? index;
}

function getMessageText(message) {
  return message.message ?? message.content ?? message.text ?? "";
}

function getMessageTime(message) {
  const value = message.createdAt ?? message.created_at ?? message.timestamp;

  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function extractList(response, key) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

export default function ManagerChatPage() {
  const user = useAppSelector((state) => state.auth.user);

  const currentUserId =
    user?.agentId ?? user?.agent_id ?? user?.id ?? user?.userId;

  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadAgents = useCallback(async () => {
    setLoadingAgents(true);
    setError("");

    try {
      const response = await api.get("/api/agents");
      const result = extractList(response, "agents");

      const otherAgents = result.filter(
        (agent) => String(getAgentId(agent)) !== String(currentUserId)
      );

      setAgents(otherAgents);

      if (otherAgents.length > 0) {
        setSelectedAgent((current) => {
          if (
            current &&
            otherAgents.some(
              (agent) =>
                String(getAgentId(agent)) === String(getAgentId(current))
            )
          ) {
            return current;
          }

          return otherAgents[0];
        });
      } else {
        setSelectedAgent(null);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load agents."
      );
    } finally {
      setLoadingAgents(false);
    }
  }, [currentUserId]);

  const loadMessages = useCallback(async () => {
    if (!selectedAgent) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);
    setError("");

    try {
      const response = await api.get(
        `/api/messages/private/${getAgentId(selectedAgent)}`
      );

      setMessages(extractList(response, "messages"));
    } catch (err) {
      setMessages([]);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load messages."
      );
    } finally {
      setLoadingMessages(false);
    }
  }, [selectedAgent]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return agents;

    return agents.filter((agent) =>
      [
        getAgentName(agent),
        agent.email,
        agent.role
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [agents, search]);

  const handleSend = async (event) => {
    event.preventDefault();

    const message = draft.trim();

    if (!message || !selectedAgent || sending) return;

    setSending(true);
    setError("");

    try {
      const response = await api.post("/api/messages", {
        receiverId: getAgentId(selectedAgent),
        message
      });

      const returnedMessage = response?.data?.message ?? response?.data;

      if (returnedMessage && typeof returnedMessage === "object") {
        setMessages((previous) => [...previous, returnedMessage]);
      } else {
        await loadMessages();
      }

      setDraft("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Message could not be sent."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <Box sx={{ height: { md: "calc(100vh - 120px)" }, minHeight: 600 }}>
      <Box mb={2.5}>
        <Typography
          variant="overline"
          color="primary.main"
          fontWeight={800}
          letterSpacing={2}
        >
          TEAM COMMUNICATION
        </Typography>

        <Typography
          variant="h4"
          fontWeight={900}
          sx={{ fontFamily: "Space Grotesk" }}
        >
          Team chat
        </Typography>

        <Typography color="text.secondary" fontSize={13} mt={0.5}>
          Communicate with your support agents.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          display: "flex",
          height: { md: "calc(100% - 100px)" },
          minHeight: 500,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "19px"
        }}
      >
        <Box
          sx={{
            width: { xs: 125, sm: 245 },
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Box p={2}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography fontWeight={900} fontSize={14}>
                Team
              </Typography>

              <IconButton
                size="small"
                onClick={loadAgents}
                disabled={loadingAgents}
                aria-label="Refresh agents"
              >
                <RefreshRounded fontSize="small" />
              </IconButton>
            </Stack>

            <TextField
              fullWidth
              size="small"
              placeholder="Search..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ mt: 1.5 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small" />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          <Divider />

          <Box sx={{ overflowY: "auto", flex: 1 }}>
            {loadingAgents ? (
              <Box py={4} textAlign="center">
                <CircularProgress size={22} />
              </Box>
            ) : filteredAgents.length === 0 ? (
              <Typography
                color="text.secondary"
                fontSize={12}
                textAlign="center"
                p={2}
              >
                No agents found.
              </Typography>
            ) : (
              filteredAgents.map((agent, index) => {
                const selected =
                  String(getAgentId(agent)) ===
                  String(getAgentId(selectedAgent || {}));

                return (
                  <Box
                    key={getAgentId(agent) ?? index}
                    onClick={() => setSelectedAgent(agent)}
                    sx={{
                      p: { xs: 1, sm: 1.5 },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      bgcolor: selected ? "action.selected" : "transparent",
                      borderLeft: selected
                        ? "3px solid"
                        : "3px solid transparent",
                      borderColor: selected ? "primary.main" : "transparent",
                      "&:hover": { bgcolor: "action.hover" }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 36,
                        height: 36,
                        bgcolor: "primary.main",
                        fontSize: 13
                      }}
                    >
                      {getAgentName(agent).charAt(0).toUpperCase()}
                    </Avatar>

                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        fontWeight={800}
                        fontSize={12}
                        noWrap
                      >
                        {getAgentName(agent)}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {agent.role || "Agent"}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            minWidth: 0
          }}
        >
          {selectedAgent ? (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                p={2}
                borderBottom="1px solid"
                borderColor="divider"
              >
                <Stack direction="row" alignItems="center" gap={1.5}>
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {getAgentName(selectedAgent).charAt(0).toUpperCase()}
                  </Avatar>

                  <Box>
                    <Typography fontWeight={900} fontSize={14}>
                      {getAgentName(selectedAgent)}
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      {selectedAgent.email || "Support agent"}
                    </Typography>
                  </Box>
                </Stack>

                <IconButton
                  onClick={loadMessages}
                  disabled={loadingMessages}
                  aria-label="Refresh messages"
                >
                  <RefreshRounded />
                </IconButton>
              </Stack>

              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: { xs: 1.5, sm: 2.5 },
                  bgcolor: "action.hover"
                }}
              >
                {loadingMessages ? (
                  <Box
                    height="100%"
                    display="grid"
                    sx={{ placeItems: "center" }}
                  >
                    <CircularProgress />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box
                    height="100%"
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <ChatBubbleOutlineRounded
                      sx={{ fontSize: 45, color: "text.secondary" }}
                    />

                    <Typography fontWeight={800} mt={1}>
                      Start a conversation
                    </Typography>

                    <Typography
                      color="text.secondary"
                      fontSize={12}
                      mt={0.5}
                    >
                      Send a message to {getAgentName(selectedAgent)}.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {messages.map((message, index) => {
                      const senderId =
                        message.senderId ??
                        message.sender_id ??
                        message.fromUserId;

                      const mine =
                        currentUserId != null &&
                        String(senderId) === String(currentUserId);

                      return (
                        <Box
                          key={getMessageId(message, index)}
                          sx={{
                            display: "flex",
                            justifyContent: mine ? "flex-end" : "flex-start"
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: "78%",
                              p: 1.5,
                              borderRadius: mine
                                ? "16px 16px 4px 16px"
                                : "16px 16px 16px 4px",
                              bgcolor: mine ? "primary.main" : "background.paper",
                              color: mine ? "#fff" : "text.primary",
                              boxShadow: 1
                            }}
                          >
                            <Typography
                              fontSize={13}
                              sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
                            >
                              {getMessageText(message)}
                            </Typography>

                            <Typography
                              variant="caption"
                              sx={{
                                display: "block",
                                textAlign: "right",
                                mt: 0.5,
                                opacity: 0.7
                              }}
                            >
                              {getMessageTime(message)}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              <Box
                component="form"
                onSubmit={handleSend}
                p={1.5}
                borderTop="1px solid"
                borderColor="divider"
              >
                <Stack direction="row" gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Write a message..."
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    multiline
                    maxRows={4}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={!draft.trim() || sending}
                    sx={{ minWidth: 48, borderRadius: 3 }}
                  >
                    {sending ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <SendRounded />
                    )}
                  </Button>
                </Stack>
              </Box>
            </>
          ) : (
            <Box
              flex={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={3}
            >
              <ChatBubbleOutlineRounded
                sx={{ fontSize: 55, color: "text.secondary" }}
              />

              <Typography fontWeight={800} mt={2}>
                Select an agent
              </Typography>

              <Typography
                color="text.secondary"
                fontSize={13}
                textAlign="center"
                mt={0.5}
              >
                Choose someone from the team list to view the conversation.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
