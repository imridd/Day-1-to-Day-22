
import {
  Box,
  Typography,
  Stack,
  Divider,
  Grid,
  Chip,
  Paper
} from "@mui/material";

import {
  PersonOutline,
  CalendarMonth,
  Business,
  ConfirmationNumber,
  DescriptionOutlined
} from "@mui/icons-material";

import StatusChip from "../common/StatusChip";
import AppButton from "../common/AppButton";

function DetailItem({ icon, label, value }) {
  return (
    <Box display="flex" gap={1.5} alignItems="flex-start">
      <Box color="primary.main">{icon}</Box>

      <Box>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>

        <Typography fontWeight={600} fontSize={13}>
          {value || "Not available"}
        </Typography>
      </Box>
    </Box>
  );
}

export default function TicketDetails({
  ticket,
  onClose,
  onReopen,
  onEdit,
  onBack
}) {
  if (!ticket) return null;

  const id = ticket.ticketId ?? ticket.id;
  const status = String(ticket.status || "").toLowerCase();

  const isClosed = ["closed", "resolved"].includes(status);

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, md: 3 },
          borderRadius: "20px",
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper"
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
        >
          <Box>
            <Typography
              variant="caption"
              fontWeight={800}
              color="primary.main"
            >
              TICKET #{id}
            </Typography>

            <Typography variant="h5" fontWeight={800} mt={0.7}>
              {ticket.title || ticket.subject || "Untitled ticket"}
            </Typography>

            <Stack direction="row" gap={1} mt={1.5} flexWrap="wrap">
              <StatusChip status={ticket.status} />
              <StatusChip status={ticket.priority} />
            </Stack>
          </Box>

          <Stack direction="row" gap={1} flexWrap="wrap">
            {onEdit && (
              <AppButton variant="outlined" onClick={() => onEdit(ticket)}>
                Edit
              </AppButton>
            )}

            {isClosed ? (
              onReopen && (
                <AppButton onClick={() => onReopen(id)}>
                  Reopen Ticket
                </AppButton>
              )
            ) : (
              onClose && (
                <AppButton
                  color="success"
                  onClick={() => onClose(id)}
                >
                  Close Ticket
                </AppButton>
              )
            )}
          </Stack>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Typography fontWeight={700} mb={1.5}>
          Description
        </Typography>

        <Typography
          color="text.secondary"
          variant="body2"
          sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
        >
          {ticket.description || "No description provided."}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography fontWeight={700} mb={2}>
          Ticket information
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <DetailItem
              icon={<ConfirmationNumber />}
              label="Ticket ID"
              value={`#${id}`}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DetailItem
              icon={<PersonOutline />}
              label="Customer"
              value={ticket.customerName || ticket.customer_name}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DetailItem
              icon={<PersonOutline />}
              label="Assigned agent"
              value={ticket.agentName || ticket.agent_name || "Unassigned"}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DetailItem
              icon={<Business />}
              label="Department"
              value={ticket.departmentName || ticket.department_name}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DetailItem
              icon={<CalendarMonth />}
              label="Created"
              value={
                ticket.createdAt || ticket.created_at
                  ? new Date(
                      ticket.createdAt || ticket.created_at
                    ).toLocaleString()
                  : "Not available"
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <DetailItem
              icon={<CalendarMonth />}
              label="Last updated"
              value={
                ticket.updatedAt || ticket.updated_at
                  ? new Date(
                      ticket.updatedAt || ticket.updated_at
                    ).toLocaleString()
                  : "Not available"
              }
            />
          </Grid>
        </Grid>

        {ticket.attachments?.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />

            <Typography fontWeight={700} mb={1.5}>
              Attachments
            </Typography>

            <Stack gap={1}>
              {ticket.attachments.map((file, index) => (
                <Chip
                  key={file.attachmentId ?? file.id ?? index}
                  icon={<DescriptionOutlined />}
                  label={file.originalName || file.filename || "Attachment"}
                  variant="outlined"
                />
              ))}
            </Stack>
          </>
        )}
      </Paper>

      {onBack && (
        <Box mt={2}>
          <AppButton
            variant="outlined"
            color="inherit"
            onClick={onBack}
          >
            Back to tickets
          </AppButton>
        </Box>
      )}
    </Box>
  );
}
