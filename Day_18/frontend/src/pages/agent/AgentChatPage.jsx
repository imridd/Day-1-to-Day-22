
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  RefreshRounded,
  SearchRounded,
  SendRounded,
  ChatBubbleOutlineRounded
} from "@mui/icons-material";

import api from "../../api/axios";
import { useAppSelector } from "../../hooks/reduxHooks";

const getId = (item) => item.agentId ?? item.agent_id ?? item.id;
const getName = (item) =>
  item.fullName ?? item.full_name ?? item.name ?? "Agent";

const getList = (response, key) => {
  const data = response?.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.[key])) return data[key];
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getText = (message) =>
  message.message ?? message.content ?? message.text ?? "";

export default function AgentChatPage() {
  const user = useAppSelector((state) => state.auth.user);
  const currentId = user?.agentId ?? user?.agent_id ?? user?.id ?? user?.userId;

  const [agents, setAgents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const loadAgents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/agents");
      const list = getList(response, "agents").filter(
        (agent) => String(getId(agent)) !== String(currentId)
      );

      setAgents(list);
      setSelected((previous) =>
        list.find((agent) => String(getId(agent)) === String(getId(previous))) ||
        list[0] ||
        null
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load agents.");
    } finally {
      setLoading(false);
    }
  }, [currentId]);

  const loadMessages = useCallback(async () => {
    if (!selected) {
      setMessages([]);
      return;
    }

    setLoadingMessages(true);

    try {
      const response = await api.get(
        `/api/messages/private/${getId(selected)}`
      );
      setMessages(getList(response, "messages"));
    } catch (err) {
      setMessages([]);
      setError(err.response?.data?.message || "Unable to load messages.");
    } finally {
      setLoadingMessages(false);
    }
  }, [selected]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const filteredAgents = useMemo(() => {
    const query = search.toLowerCase().trim();

    return agents.filter((agent) =>
      `${getName(agent)} ${agent.email ?? ""}`
        .toLowerCase()
        .includes(query)
    );
  }, [agents, search]);

  const sendMessage = async (event) => {
    event.preventDefault();

    const message = draft.trim();
    if (!message || !selected || sending) return;

    setSending(true);
    setError("");

    try {
      const response = await api.post("/api/messages", {
        receiverId: getId(selected),
        message
      });

      const returned = response?.data?.message ?? response?.data;

      if (returned && typeof returned === "object") {
        setMessages((previous) => [...previous, returned]);
      } else {
        await loadMessages();
      }

      setDraft("");
    } catch (err) {
      setError(err.response?.data?.message || "Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Box>
      <Box mb={2.5}>
        <Typography variant="overline" color="primary.main" fontWeight={800}>
          TEAM COMMUNICATION
        </Typography>
        <Typography variant="h4" fontWeight={900}
          sx={{ fontFamily: "Space Grotesk" }}>
          Agent chat
        </Typography>
        <Typography color="text.secondary" fontSize={13}>
          Connect with your support teammates.
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
          height: { xs: 600, md: "calc(100vh - 210px)" },
          minHeight: 500,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4
        }}
      >
        <Box
          sx={{
            width: { xs: 120, sm: 240 },
            flexShrink: 0,
            borderRight: "1px solid",
            borderColor: "divider",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <Box p={1.5}>
            <Stack direction="row" justifyContent="space-between">
              <Typography fontWeight={900}>Agents</Typography>
              <IconButton size="small" onClick={loadAgents}>
                <RefreshRounded fontSize="small" />
              </IconButton>
            </Stack>

            <TextField
              fullWidth
              size="small"
              placeholder="Search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ mt: 1 }}
              InputProps={{
                startAdornment: (
                  <SearchRounded sx={{ mr: 1 }} fontSize="small" />
                )
              }}
            />
          </Box>

          <Divider />

          <Box sx={{ overflowY: "auto", flex: 1 }}>
            {loading ? (
              <Box textAlign="center" p={3}>
                <CircularProgress size={22} />
              </Box>
            ) : filteredAgents.length === 0 ? (
              <Typography p={2} fontSize={12} color="text.secondary">
                No teammates found.
              </Typography>
            ) : (
              filteredAgents.map((agent, index) => {
                const active =
                  String(getId(agent)) === String(getId(selected || {}));

                return (
                  <Box
                    key={getId(agent) ?? index}
                    onClick={() => setSelected(agent)}
                    sx={{
                      p: { xs: 1, sm: 1.5 },
                      display: "flex",
                      gap: 1,
                      alignItems: "center",
                      cursor: "pointer",
                      bgcolor: active ? "action.selected" : "transparent",
                      borderLeft: active ? "3px solid" : "3px solid transparent",
                      borderColor: active ? "primary.main" : "transparent",
                      "&:hover": { bgcolor: "action.hover" }
                    }}
                  >
                    <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main" }}>
                      {getName(agent).charAt(0).toUpperCase()}
                    </Avatar>
                    <Box minWidth={0}>
                      <Typography fontSize={12} fontWeight={800} noWrap>
                        {getName(agent)}
                      </Typography>
                      <Typography fontSize={10} color="text.secondary" noWrap>
                        {agent.email || "Support teammate"}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        <Box flex={1} minWidth={0} display="flex" flexDirection="column">
          {selected ? (
            <>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                p={1.5}
                borderBottom="1px solid"
                borderColor="divider"
              >
                <Stack direction="row" gap={1} alignItems="center">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {getName(selected).charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={900} fontSize={13}>
                      {getName(selected)}
                    </Typography>
                    <Typography fontSize={11} color="text.secondary">
                      {selected.email || "Agent"}
                    </Typography>
                  </Box>
                </Stack>

                <IconButton onClick={loadMessages} aria-label="Refresh messages">
                  <RefreshRounded />
                </IconButton>
              </Stack>

              <Box flex={1} overflow="auto" p={2} bgcolor="action.hover">
                {loadingMessages ? (
                  <Box height="100%" display="grid" sx={{ placeItems: "center" }}>
                    <CircularProgress />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box
                    height="100%"
                    display="flex"
                    flexDirection="column"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <ChatBubbleOutlineRounded
                      sx={{ fontSize: 44, color: "text.secondary" }}
                    />
                    <Typography fontWeight={800} mt={1}>
                      No messages yet
                    </Typography>
                    <Typography color="text.secondary" fontSize={12}>
                      Start the conversation.
                    </Typography>
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {messages.map((message, index) => {
                      const sender =
                        message.senderId ??
                        message.sender_id ??
                        message.fromUserId;

                      const mine =
                        currentId != null &&
                        String(sender) === String(currentId);

                      return (
                        <Box
                          key={message.messageId ?? message.message_id ?? message.id ?? index}
                          display="flex"
                          justifyContent={mine ? "flex-end" : "flex-start"}
                        >
                          <Box
                            sx={{
                              maxWidth: "80%",
                              p: 1.5,
                              bgcolor: mine ? "primary.main" : "background.paper",
                              color: mine ? "#fff" : "text.primary",
                              borderRadius: 3,
                              overflowWrap: "anywhere"
                            }}
                          >
                            <Typography fontSize={13} whiteSpace="pre-wrap">
                              {getText(message)}
                            </Typography>
                            <Typography
                              fontSize={10}
                              textAlign="right"
                              sx={{ opacity: 0.7, mt: 0.5 }}
                            >
                              {message.createdAt || message.created_at
                                ? new Date(
                                    message.createdAt ?? message.created_at
                                  ).toLocaleTimeString("en-IN", {
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })
                                : ""}
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                )}
              </Box>

              <Box component="form" onSubmit={sendMessage} p={1.5}
                borderTop="1px solid" borderColor="divider">
                <Stack direction="row" gap={1}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
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
                    {sending
                      ? <CircularProgress size={20} color="inherit" />
                      : <SendRounded />}
                  </Button>
                </Stack>
              </Box>
            </>
          ) : (
            <Box flex={1} display="grid" sx={{ placeItems: "center" }}>
              <Typography color="text.secondary">
                Select a teammate to chat.
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
