
import { useState } from "react";

import {
  Box,
  Stack,
  Typography,
  Paper
} from "@mui/material";

import ForumRoundedIcon from "@mui/icons-material/ForumRounded";

import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

export default function GlobalChat({
  conversations = [],
  messages = [],
  currentUserId,
  onSelectConversation,
  onSend,
  loading = false
}) {
  const [selected, setSelected] = useState(null);

  const handleSelect = (conversation) => {
    setSelected(conversation);
    onSelectConversation?.(conversation);
  };

  const selectedId =
    selected?.conversationId ??
    selected?.id ??
    selected?.userId;

  return (
    <Box>
      <Stack direction="row" alignItems="center" gap={1.5} mb={2.5}>
        <ForumRoundedIcon color="primary" fontSize="large" />

        <Box>
          <Typography variant="h5" fontWeight={900}>
            Team Lounge
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Keep the team connected.
          </Typography>
        </Box>
      </Stack>

      <Stack
        direction={{ xs: "column", md: "row" }}
        gap={2}
        sx={{ height: { xs: "auto", md: 620 } }}
      >
        <Box sx={{ width: { xs: "100%", md: 310 }, flexShrink: 0 }}>
          <ChatSidebar
            conversations={conversations}
            selectedId={selectedId}
            onSelect={handleSelect}
          />
        </Box>

        <Box flex={1} minWidth={0} minHeight={450}>
          {selected ? (
            <ChatWindow
              messages={messages}
              currentUserId={currentUserId}
              recipient={{
                name: selected.name || selected.customerName || selected.agentName,
                subtitle: "Team conversation"
              }}
              onSend={(message) => onSend?.(message, selected)}
              loading={loading}
            />
          ) : (
            <Paper
              elevation={0}
              sx={{
                height: "100%",
                minHeight: 450,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: "divider"
              }}
            >
              <Box textAlign="center" p={3}>
                <ForumRoundedIcon
                  sx={{ fontSize: 55, color: "primary.main", mb: 1 }}
                />

                <Typography fontWeight={800} variant="h6">
                  Pick a conversation
                </Typography>

                <Typography color="text.secondary" variant="body2">
                  Select a conversation to start messaging.
                </Typography>
              </Box>
            </Paper>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
