
import { Box, Typography, Avatar, Stack } from "@mui/material";
import DoneAllIcon from "@mui/icons-material/DoneAll";

export default function ChatMessage({
  message,
  currentUserId
}) {
  const senderId =
    message.senderId ??
    message.sender_id ??
    message.userId ??
    message.user_id;

  const isMine =
    currentUserId != null &&
    senderId != null &&
    String(senderId) === String(currentUserId);

  const sender =
    message.senderName ||
    message.sender_name ||
    message.username ||
    "User";

  const content =
    message.content ||
    message.message ||
    message.text ||
    "";

  const timestamp =
    message.createdAt ||
    message.created_at;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        mb: 2
      }}
    >
      <Stack
        direction={isMine ? "row-reverse" : "row"}
        alignItems="flex-end"
        gap={1}
        maxWidth="85%"
      >
        {!isMine && (
          <Avatar sx={{ width: 30, height: 30, fontSize: 12 }}>
            {sender.charAt(0).toUpperCase()}
          </Avatar>
        )}

        <Box>
          {!isMine && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ ml: 1, mb: 0.4, display: "block" }}
            >
              {sender}
            </Typography>
          )}

          <Box
            sx={{
              px: 2,
              py: 1.3,
              borderRadius: isMine
                ? "18px 18px 4px 18px"
                : "18px 18px 18px 4px",
              background: isMine
                ? "linear-gradient(135deg, #7C3AED, #A855F7)"
                : "action.hover",
              color: isMine ? "#fff" : "text.primary",
              overflowWrap: "anywhere"
            }}
          >
            <Typography fontSize={13} sx={{ whiteSpace: "pre-wrap" }}>
              {content}
            </Typography>
          </Box>

          <Stack
            direction="row"
            justifyContent={isMine ? "flex-end" : "flex-start"}
            alignItems="center"
            gap={0.5}
            mt={0.5}
          >
            <Typography variant="caption" color="text.secondary">
              {timestamp
                ? new Date(timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : ""}
            </Typography>

            {isMine && (
              <DoneAllIcon
                sx={{ fontSize: 13, color: "primary.main" }}
              />
            )}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
