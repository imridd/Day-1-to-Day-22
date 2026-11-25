
import {
  Box,
  Typography,
  Stack,
  Avatar
} from "@mui/material";

import {
  History,
  AddCircleOutline,
  EditOutlined,
  PersonOutline,
  CheckCircleOutline
} from "@mui/icons-material";

import EmptyState from "../common/EmptyState";

function getActivityIcon(action) {
  const value = String(action || "").toLowerCase();

  if (value.includes("creat")) return <AddCircleOutline />;
  if (value.includes("assign")) return <PersonOutline />;
  if (value.includes("clos") || value.includes("resolv")) {
    return <CheckCircleOutline />;
  }

  return <EditOutlined />;
}

export default function TicketHistory({ history = [] }) {
  if (!history.length) {
    return (
      <EmptyState
        title="No activity yet"
        description="Ticket updates and actions will appear here."
        icon={<History sx={{ fontSize: 38 }} />}
      />
    );
  }

  return (
    <Box>
      <Typography variant="h6" fontWeight={800} mb={2.5}>
        Activity timeline
      </Typography>

      <Stack spacing={0}>
        {history.map((item, index) => {
          const actor =
            item.actorName ||
            item.agentName ||
            item.customerName ||
            item.actor_name ||
            "System";

          const action =
            item.action ||
            item.actionType ||
            item.action_type ||
            "Updated ticket";

          const date =
            item.createdAt ||
            item.created_at;

          return (
            <Box
              key={item.historyId ?? item.id ?? index}
              sx={{
                display: "flex",
                gap: 2,
                minHeight: 90
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center"
                }}
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    color: "primary.main",
                    backgroundColor: "action.hover"
                  }}
                >
                  {getActivityIcon(action)}
                </Avatar>

                {index !== history.length - 1 && (
                  <Box
                    sx={{
                      flex: 1,
                      width: 2,
                      minHeight: 40,
                      backgroundColor: "divider",
                      my: 0.5
                    }}
                  />
                )}
              </Box>

              <Box sx={{ pb: 2, flex: 1 }}>
                <Typography fontWeight={700} fontSize={13}>
                  {action}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  By {actor}
                </Typography>

                {item.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    mt={0.5}
                  >
                    {item.description}
                  </Typography>
                )}

                <Typography
                  variant="caption"
                  color="text.secondary"
                  mt={0.7}
                  display="block"
                >
                  {date ? new Date(date).toLocaleString() : "Time unavailable"}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}
