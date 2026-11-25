
import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Avatar,
  Chip
} from "@mui/material";

import {
  AccessTime,
  ConfirmationNumber,
  PersonOutline
} from "@mui/icons-material";

import StatusChip from "../common/StatusChip";

export default function TicketCard({ ticket, onClick }) {
  const id = ticket.ticketId ?? ticket.id;
  const title = ticket.title || ticket.subject || "Untitled ticket";

  const customer =
    ticket.customerName || ticket.customer_name || "Customer";

  const priority = String(ticket.priority || "medium").toLowerCase();

  const priorityColors = {
    high: "error",
    medium: "warning",
    low: "success",
    urgent: "error"
  };

  return (
    <Card
      onClick={() => onClick?.(ticket)}
      className="hover-lift"
      sx={{
        cursor: onClick ? "pointer" : "default",
        borderRadius: "19px",
        backgroundColor: "background.paper"
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <Box>
            <Typography
              variant="caption"
              color="primary.main"
              fontWeight={800}
            >
              #{id ?? "NEW"}
            </Typography>

            <Typography
              fontWeight={700}
              fontSize={16}
              mt={0.7}
              sx={{ wordBreak: "break-word" }}
            >
              {title}
            </Typography>
          </Box>

          <StatusChip status={ticket.status} />
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          mt={1}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden"
          }}
        >
          {ticket.description || "No description provided."}
        </Typography>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mt={2.5}
          gap={1}
          flexWrap="wrap"
        >
          <Stack direction="row" alignItems="center" gap={0.8}>
            <Avatar sx={{ width: 27, height: 27, fontSize: 11 }}>
              {customer.charAt(0).toUpperCase()}
            </Avatar>

            <Typography variant="caption" color="text.secondary">
              {customer}
            </Typography>
          </Stack>

          <Chip
            size="small"
            color={priorityColors[priority] || "default"}
            label={priority.toUpperCase()}
            variant="outlined"
          />
        </Stack>

        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mt={2}
        >
          <Stack direction="row" gap={0.6} alignItems="center">
            <PersonOutline fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {ticket.agentName || ticket.agent_name || "Unassigned"}
            </Typography>
          </Stack>

          <Stack direction="row" gap={0.6} alignItems="center">
            <AccessTime fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {ticket.createdAt || ticket.created_at
                ? new Date(ticket.createdAt || ticket.created_at).toLocaleDateString()
                : "Recently"}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
