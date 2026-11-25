
import { useState } from "react";

import {
  Box,
  IconButton,
  TextField,
  Stack,
  Tooltip
} from "@mui/material";

import SendRoundedIcon from "@mui/icons-material/SendRounded";

export default function ChatInput({
  onSend,
  disabled = false,
  placeholder = "Type a message..."
}) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmed = message.trim();

    if (!trimmed || disabled) return;

    onSend?.(trimmed);
    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <Box
      sx={{
        p: 1.5,
        borderTop: "1px solid",
        borderColor: "divider"
      }}
    >
      <Stack direction="row" alignItems="flex-end" gap={1}>
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder={placeholder}
          value={message}
          disabled={disabled}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "15px",
              backgroundColor: "action.hover"
            }
          }}
        />

        <Tooltip title="Send message">
          <span>
            <IconButton
              onClick={handleSend}
              disabled={disabled || !message.trim()}
              sx={{
                width: 44,
                height: 44,
                borderRadius: "13px",
                background: "linear-gradient(135deg, #7C3AED, #A855F7)",
                color: "#fff",
                "&:hover": {
                  background: "linear-gradient(135deg, #6D28D9, #9333EA)"
                },
                "&.Mui-disabled": {
                  backgroundColor: "action.disabledBackground"
                }
              }}
            >
              <SendRoundedIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}
