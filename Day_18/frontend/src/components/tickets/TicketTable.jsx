
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Avatar,
  Stack,
  IconButton,
  Tooltip,
  Box
} from "@mui/material";

import {
  VisibilityOutlined,
  EditOutlined,
  DeleteOutline
} from "@mui/icons-material";

import StatusChip from "../common/StatusChip";
import EmptyState from "../common/EmptyState";

export default function TicketTable({
  tickets = [],
  onView,
  onEdit,
  onDelete
}) {
  if (!tickets.length) {
    return (
      <EmptyState
        title="No tickets found"
        description="There are no tickets matching your current filters."
      />
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        borderRadius: "18px",
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "background.paper",
        boxShadow: "none",
        overflowX: "auto"
      }}
    >
      <Table sx={{ minWidth: 850 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "action.hover" }}>
            {[
              "Ticket",
              "Customer",
              "Assigned Agent",
              "Priority",
              "Status",
              "Created",
              "Actions"
            ].map((heading) => (
              <TableCell
                key={heading}
                sx={{
                  fontWeight: 800,
                  fontSize: 11,
                  color: "text.secondary",
                  whiteSpace: "nowrap",
                  letterSpacing: 0.5
                }}
              >
                {heading.toUpperCase()}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {tickets.map((ticket, index) => {
            const id = ticket.ticketId ?? ticket.id;
            const customer =
              ticket.customerName || ticket.customer_name || "Customer";

            return (
              <TableRow
                key={id ?? index}
                hover
                sx={{
                  "&:last-child td": { borderBottom: 0 }
                }}
              >
                <TableCell>
                  <Box>
                    <Typography
                      fontWeight={800}
                      color="primary.main"
                      fontSize={11}
                    >
                      #{id ?? "N/A"}
                    </Typography>

                    <Typography fontWeight={700} fontSize={13}>
                      {ticket.title || ticket.subject || "Untitled"}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Avatar sx={{ width: 29, height: 29, fontSize: 11 }}>
                      {customer.charAt(0).toUpperCase()}
                    </Avatar>
                    <Typography fontSize={12}>
                      {customer}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Typography fontSize={12}>
                    {ticket.agentName || ticket.agent_name || "Unassigned"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <StatusChip status={ticket.priority} />
                </TableCell>

                <TableCell>
                  <StatusChip status={ticket.status} />
                </TableCell>

                <TableCell>
                  <Typography fontSize={12} color="text.secondary">
                    {ticket.createdAt || ticket.created_at
                      ? new Date(
                          ticket.createdAt || ticket.created_at
                        ).toLocaleDateString()
                      : "—"}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Stack direction="row" gap={0.3}>
                    <Tooltip title="View">
                      <IconButton
                        size="small"
                        onClick={() => onView?.(ticket)}
                      >
                        <VisibilityOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => onEdit?.(ticket)}
                      >
                        <EditOutlined fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete?.(ticket)}
                      >
                        <DeleteOutline fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
