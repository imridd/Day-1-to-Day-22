
import { useState } from "react";

import {
  Box,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  Avatar,
  Badge,
  List,
  ListItemButton,
  Divider
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import EmptyState from "../common/EmptyState";

export default function ChatSidebar({
  conversations = [],
  selectedId,
  onSelect
}) {
  const [search, setSearch] = useState("");

  const filtered = conversations.filter((item) => {
    const name =
      item.name ||
      item.customerName ||
      item.agentName ||
      "";

    return name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Box
      sx={{
        width: { xs: "100%", md: 310 },
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "20px",
        overflow: "hidden",
        backgroundColor: "background.paper"
      }}
    >
      <Box p={2}>
        <Typography variant="h6" fontWeight={800}>
          Messages
        </Typography>

        <Typography variant="caption" color="text.secondary">
          Your conversations, all in one place.
        </Typography>

        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mt: 2 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              )
            }
          }}
        />
      </Box>

      <Divider />

      <List sx={{ maxHeight: 500, overflowY: "auto", p: 1 }}>
        {filtered.length === 0 ? (
          <EmptyState
            title="No conversations"
            description="Your conversations will appear here."
          />
        ) : (
          filtered.map((item, index) => {
            const id = item.conversationId ?? item.id ?? item.userId;

            const name =
              item.name ||
              item.customerName ||
              item.agentName ||
              "Unknown user";

            return (
              <ListItemButton
                key={id ?? index}
                selected={String(selectedId) === String(id)}
                onClick={() => onSelect?.(item)}
                sx={{
                  borderRadius: "14px",
                  mb: 0.5,
                  py: 1.5,
                  "&.Mui-selected": {
                    backgroundColor: "action.selected"
                  }
                }}
              >
                <Stack direction="row" alignItems="center" gap={1.5} width="100%">
                  <Avatar sx={{ bgcolor: "primary.main" }}>
                    {name.charAt(0).toUpperCase()}
                  </Avatar>

                  <Box flex={1} minWidth={0}>
                    <Typography fontWeight={700} fontSize={13} noWrap>
                      {name}
                    </Typography>

                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      display="block"
                    >
                      {item.lastMessage || item.last_message || "Start chatting"}
                    </Typography>
                  </Box>

                  {Number(item.unreadCount || item.unread_count || 0) > 0 && (
                    <Badge
                      badgeContent={item.unreadCount || item.unread_count}
                      color="primary"
                    />
                  )}
                </Stack>
              </ListItemButton>
            );
          })
        )}
      </List>
    </Box>
  );
}
