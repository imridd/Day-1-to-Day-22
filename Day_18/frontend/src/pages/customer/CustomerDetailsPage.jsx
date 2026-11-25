
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import {
  ArrowBackRounded,
  ConfirmationNumberOutlined,
  PersonOutlineRounded,
  CalendarMonthRounded,
  HistoryRounded,
  RefreshRounded,
  SupportAgentRounded
} from "@mui/icons-material";

import api from "../../api/axios";

function getTicket(response) {
  const data = response?.data;
  return data?.ticket ?? data?.data ?? data;
}

function getHistory(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.history)) return data.history;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function value(...items) {
  return items.find(
    (item) => item !== undefined && item !== null && item !== ""
  ) ?? "—";
}

function formatDate(dateValue) {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function DetailItem({ label, detail, icon }) {
  return (
    <Stack direction="row" alignItems="flex-start" gap={1.5}>
      <Avatar
        sx={{
          width: 35,
          height: 35,
          bgcolor: "action.hover",
          color: "primary.main"
        }}
      >
        {icon}
      </Avatar>

      <Box>
        <Typography
          fontSize={11}
          fontWeight={700}
          color="text.secondary"
        >
          {label}
        </Typography>

        <Typography fontSize={13} fontWeight={800} mt={0.3}>
          {detail}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function CustomerTicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [historyError, setHistoryError] = useState("");

  const loadTicket = useCallback(async () => {
    if (!id) {
      setError("Ticket ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/api/tickets/${id}`);
      setTicket(getTicket(response));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load this support request."
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadHistory = useCallback(async () => {
    if (!id) return;

    setHistoryError("");

    try {
      const response = await api.get(`/api/tickets/${id}/history`);
      setHistory(getHistory(response));
    } catch (err) {
      setHistory([]);
      setHistoryError(
        err.response?.data?.message ||
          "Activity history is currently unavailable."
      );
    }
  }, [id]);

  useEffect(() => {
    loadTicket();
    loadHistory();
  }, [loadTicket, loadHistory]);

  if (loading) {
    return (
      <Box
        minHeight="50vh"
        display="grid"
        sx={{ placeItems: "center" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error || !ticket) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/customer/tickets")}
          sx={{ mb: 2 }}
        >
          Back to requests
        </Button>

        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error || "Ticket not found."}
        </Alert>

        <Button
          startIcon={<RefreshRounded />}
          onClick={loadTicket}
          sx={{ mt: 2 }}
        >
          Try again
        </Button>
      </Box>
    );
  }

  const status = String(ticket.status ?? "unknown")
    .toLowerCase()
    .replaceAll("_", " ");

  const priority = String(ticket.priority ?? "medium").toLowerCase();

  const statusColor = ["resolved", "closed"].includes(status)
    ? "success"
    : ["pending", "in progress"].includes(status)
      ? "warning"
      : "info";

  const priorityColor = {
    urgent: "error",
    high: "warning",
    medium: "info",
    low: "success"
  }[priority] || "default";

  const ticketId = ticket.ticketId ?? ticket.ticket_id ?? ticket.id ?? id;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate("/customer/tickets")}
        sx={{ mb: 2 }}
      >
        Back to my requests
      </Button>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          mb: 2
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
              color="primary.main"
              fontWeight={900}
              fontSize={12}
              letterSpacing={1}
            >
              REQUEST #{ticketId}
            </Typography>

            <Typography
              variant="h4"
              fontWeight={900}
              mt={0.5}
              sx={{
                fontFamily: "Space Grotesk",
                overflowWrap: "anywhere"
              }}
            >
              {value(ticket.title, ticket.subject)}
            </Typography>

            <Stack direction="row" gap={1} mt={1.5} flexWrap="wrap">
              <Chip
                size="small"
                label={status}
                color={statusColor}
                variant="outlined"
                sx={{ textTransform: "capitalize", fontWeight: 800 }}
              />

              <Chip
                size="small"
                label={`${priority} priority`}
                color={priorityColor}
                sx={{ textTransform: "capitalize", fontWeight: 800 }}
              />
            </Stack>
          </Box>

          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={() => {
              loadTicket();
              loadHistory();
            }}
            sx={{ borderRadius: 3 }}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "minmax(0, 1.7fr) minmax(260px, 1fr)"
          },
          gap: 2
        }}
      >
        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Typography fontWeight={900} mb={1.5}>
              Your issue
            </Typography>

            <Typography
              color="text.secondary"
              fontSize={13}
              lineHeight={1.8}
              sx={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
            >
              {value(ticket.description, ticket.details)}
            </Typography>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Stack direction="row" alignItems="center" gap={1} mb={2}>
              <HistoryRounded color="primary" />
              <Typography fontWeight={900}>
                Request activity
              </Typography>
            </Stack>

            {historyError && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {historyError}
              </Alert>
            )}

            {history.length === 0 ? (
              <Typography color="text.secondary" fontSize={13}>
                No activity has been recorded yet.
              </Typography>
            ) : (
              <Stack spacing={2.5}>
                {history.map((item, index) => {
                  const title =
                    item.action ??
                    item.event ??
                    item.description ??
                    item.status ??
                    "Request updated";

                  const actor =
                    item.actorName ??
                    item.actor_name ??
                    item.userName ??
                    item.user_name ??
                    "Support team";

                  const timestamp =
                    item.createdAt ??
                    item.created_at ??
                    item.timestamp;

                  return (
                    <Stack
                      key={
                        item.historyId ??
                        item.history_id ??
                        item.id ??
                        index
                      }
                      direction="row"
                      gap={1.5}
                    >
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          mt: 0.8,
                          borderRadius: "50%",
                          bgcolor: "primary.main",
                          flexShrink: 0
                        }}
                      />

                      <Box>
                        <Typography fontSize={13} fontWeight={800}>
                          {String(title).replaceAll("_", " ")}
                        </Typography>

                        <Typography
                          color="text.secondary"
                          fontSize={11}
                          mt={0.3}
                        >
                          {actor} · {formatDate(timestamp)}
                        </Typography>
                      </Box>
                    </Stack>
                  );
                })}
              </Stack>
            )}
          </Paper>
        </Stack>

        <Stack spacing={2}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Typography fontWeight={900} mb={2}>
              Request information
            </Typography>

            <Stack spacing={2.5}>
              <DetailItem
                label="Request ID"
                detail={ticketId}
                icon={<ConfirmationNumberOutlined fontSize="small" />}
              />

              <Divider />

              <DetailItem
                label="Department"
                detail={value(
                  ticket.departmentName,
                  ticket.department_name,
                  ticket.department?.name
                )}
                icon={<ConfirmationNumberOutlined fontSize="small" />}
              />

              <Divider />

              <DetailItem
                label="Assigned support agent"
                detail={value(
                  ticket.agent?.fullName,
                  ticket.agent?.full_name,
                  ticket.agentName,
                  ticket.agent_name,
                  ticket.assignedTo?.name
                )}
                icon={<SupportAgentRounded fontSize="small" />}
              />

              <Divider />

              <DetailItem
                label="Submitted on"
                detail={formatDate(ticket.createdAt ?? ticket.created_at)}
                icon={<CalendarMonthRounded fontSize="small" />}
              />

              <Divider />

              <DetailItem
                label="Last updated"
                detail={formatDate(ticket.updatedAt ?? ticket.updated_at)}
                icon={<CalendarMonthRounded fontSize="small" />}
              />
            </Stack>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Stack direction="row" gap={1.2} alignItems="center">
              <SupportAgentRounded color="primary" />
              <Box>
                <Typography fontWeight={900} fontSize={13}>
                  Need more help?
                </Typography>
                <Typography color="text.secondary" fontSize={11}>
                  Contact your support team for assistance.
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
