
import { useEffect, useRef } from "react";

import {
  Box,
  Typography,
  Stack,
  Avatar,
  Paper,
  Divider
} from "@mui/material";

import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";

import EmptyState from "../common/EmptyState";
import AppLoader from "../common/AppLoader";

export default function ChatWindow({
  messages = [],
  currentUserId,
  recipient,
  onSend,
  loading = false,
  disabled = false
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  return (
    <Paper
      elevation={0}
      sx={{
        height: "100%",
        minHeight: 450,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: "20px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper"
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        gap={1.5}
        p={2}
      >
        <Avatar sx={{ bgcolor: "primary.main" }}>
          {(recipient?.name || "C").charAt(0).toUpperCase()}
        </Avatar>

        <Box flex={1}>
          <Typography fontWeight={800}>
            {recipient?.name || "Conversation"}
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {recipient?.subtitle || "Support conversation"}
          </Typography>
        </Box>
      </Stack>

      <Divider />

      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 2,
          minHeight: 250
        }}
      >
        {loading ? (
          <AppLoader message="Loading conversation..." />
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Start the conversation by sending a message."
          />
        ) : (
          messages.map((message, index) => (
            <ChatMessage
              key={message.messageId ?? message.id ?? index}
              message={message}
              currentUserId={currentUserId}
            />
          ))
        )}

        <div ref={bottomRef} />
      </Box>

      <ChatInput
        onSend={onSend}
        disabled={disabled || loading}
      />
    </Paper>
  );
}
