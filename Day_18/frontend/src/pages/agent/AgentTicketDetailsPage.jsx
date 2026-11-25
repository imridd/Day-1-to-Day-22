
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
  CheckCircleOutlineRounded,
  RefreshRounded,
  HistoryRounded,
  ConfirmationNumberOutlined,
  PersonOutlineRounded,
  CalendarMonthRounded,
  CloseRounded
} from "@mui/icons-material";

import api from "../../api/axios";

function getStatus(ticket) {
  return String(ticket?.status ?? "unknown")
    .toLowerCase()
    .replaceAll("_", " ");
}

function getPriority(ticket) {
  return String(ticket?.priority ?? "medium").toLowerCase();
}

function getValue(...values) {
  return values.find(
    (value) => value !== undefined && value !== null && value !== ""
  ) ?? "—";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getHistoryList(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.history)) return data.history;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getTicket(response) {
  const data = response?.data;

  return data?.ticket ?? data?.data ?? data;
}

function DetailItem({ label, value, icon }) {
  return (
    <Stack direction="row" alignItems="flex-start" gap={1.5}>
      <Avatar
        sx={{
          width: 34,
          height: 34,
          bgcolor: "action.hover",
          color: "primary.main"
        }}
      >
        {icon}
      </Avatar>

      <Box>
        <Typography
          color="text.secondary"
          fontSize={11}
          fontWeight={700}
        >
          {label}
        </Typography>

        <Typography fontSize={13} fontWeight={800} mt={0.3}>
          {value}
        </Typography>
      </Box>
    </Stack>
  );
}

function HistoryEntry({ item }) {
  const title =
    item.action ??
    item.event ??
    item.description ??
    item.status ??
    "Ticket updated";

  const actor =
    item.actorName ??
    item.actor_name ??
    item.userName ??
    item.user_name ??
    item.updatedBy ??
    "System";

  const timestamp =
    item.createdAt ??
    item.created_at ??
    item.timestamp;

  return (
    <Stack direction="row" gap={1.5}>
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

      <Box flex={1}>
        <Typography fontSize={13} fontWeight={800}>
          {String(title).replaceAll("_", " ")}
        </Typography>

        <Typography color="text.secondary" fontSize={11} mt={0.3}>
          {actor} · {formatDate(timestamp)}
        </Typography>
      </Box>
    </Stack>
  );
}

export default function AgentTicketDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
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
          err.message ||
          "Unable to load ticket details."
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
      setHistory(getHistoryList(response));
    } catch (err) {
      setHistory([]);
      setHistoryError(
        err.response?.data?.message ||
          "Ticket history is not available."
      );
    }
  }, [id]);

  useEffect(() => {
    loadTicket();
    loadHistory();
  }, [loadTicket, loadHistory]);

  const handleStatusChange = async () => {
    if (!ticket || updating) return;

    const status = getStatus(ticket);
    const isClosed = ["closed", "resolved"].includes(status);

    const action = isClosed ? "reopen" : "close";
    const confirmed = window.confirm(
      `Are you sure you want to ${action} this ticket?`
    );

    if (!confirmed) return;

    setUpdating(true);
    setError("");

    try {
      if (isClosed) {
        await api.patch(`/api/tickets/${id}/reopen`);
      } else {
        await api.patch(`/api/tickets/${id}/close`);
      }

      await Promise.all([loadTicket(), loadHistory()]);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          `Unable to ${action} this ticket.`
      );
    } finally {
      setUpdating(false);
    }
  };

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

  if (error && !ticket) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackRounded />}
          onClick={() => navigate("/agent/tickets")}
          sx={{ mb: 2 }}
        >
          Back to tickets
        </Button>

        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error}
        </Alert>

        <Button
          startIcon={<RefreshRounded />}
          onClick={loadTicket}
          sx={{ mt: 2 }}
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!ticket) return null;

  const status = getStatus(ticket);
  const priority = getPriority(ticket);
  const isClosed = ["closed", "resolved"].includes(status);

  const customerName = getValue(
    ticket.customerName,
    ticket.customer_name,
    ticket.customer?.name
  );

  const assignedAgent = getValue(
    ticket.agent?.fullName,
    ticket.agent?.full_name,
    ticket.agentName,
    ticket.agent_name,
    ticket.assignedTo?.name
  );

  return (
    <Box>
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate("/agent/tickets")}
        sx={{ mb: 2 }}
      >
        Back to my tickets
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

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
              fontSize={12}
              fontWeight={900}
              letterSpacing={1}
            >
              TICKET #{ticket.ticketId ?? ticket.ticket_id ?? ticket.id ?? id}
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
              {getValue(ticket.title, ticket.subject)}
            </Typography>

            <Stack direction="row" gap={1} mt={1.5} flexWrap="wrap">
              <Chip
                label={status}
                color={isClosed ? "success" : "info"}
                variant="outlined"
                sx={{ textTransform: "capitalize", fontWeight: 800 }}
              />

              <Chip
                label={priority}
                color={
                  priority === "urgent"
                    ? "error"
                    : priority === "high"
                      ? "warning"
                      : priority === "low"
                        ? "success"
                        : "info"
                }
                sx={{ textTransform: "capitalize", fontWeight: 800 }}
              />
            </Stack>
          </Box>

          <Button
            variant="contained"
            color={isClosed ? "success" : "warning"}
            startIcon={
              isClosed
                ? <RefreshRounded />
                : <CheckCircleOutlineRounded />
            }
            onClick={handleStatusChange}
            disabled={updating}
            sx={{ borderRadius: 3, minWidth: 140 }}
          >
            {updating
              ? "Updating..."
              : isClosed
                ? "Reopen ticket"
                : "Close ticket"}
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
              Description
            </Typography>

            <Typography
              fontSize={13}
              color="text.secondary"
              sx={{ whiteSpace: "pre-wrap", lineHeight: 1.8 }}
            >
              {getValue(ticket.description, ticket.details)}
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
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              mb={2}
            >
              <HistoryRounded color="primary" />
              <Typography fontWeight={900}>
                Ticket activity
              </Typography>
            </Stack>

            {historyError && (
              <Alert severity="info" sx={{ mb: 2 }}>
                {historyError}
              </Alert>
            )}

            {history.length === 0 ? (
              <Typography color="text.secondary" fontSize={13}>
                No activity history available.
              </Typography>
            ) : (
              <Stack spacing={2.5}>
                {history.map((item, index) => (
                  <HistoryEntry
                    key={
                      item.historyId ??
                      item.history_id ??
                      item.id ??
                      index
                    }
                    item={item}
                  />
                ))}
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
              Ticket information
            </Typography>

            <Stack spacing={2.5}>
              <DetailItem
                label="Customer"
                value={customerName}
                icon={<PersonOutlineRounded fontSize="small" />}
              />

              <Divider />

              <DetailItem
                label="Assigned agent"
                value={assignedAgent}
                icon={<PersonOutlineRounded fontSize="small" />}
              />

              <Divider />

              <DetailItem
                label="Created"
                value={formatDate(
                  ticket.createdAt ?? ticket.created_at
                )}
                icon={<CalendarMonthRounded fontSize="small" />}
              />

              <Divider />

              <DetailItem
                label="Department"
                value={getValue(
                  ticket.departmentName,
                  ticket.department_name,
                  ticket.department?.name
                )}
                icon={<ConfirmationNumberOutlined fontSize="small" />}
              />

              <Divider />

              <DetailItem
                label="Ticket ID"
                value={ticket.ticketId ?? ticket.ticket_id ?? ticket.id ?? id}
                icon={<ConfirmationNumberOutlined fontSize="small" />}
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
            <Typography fontWeight={900} mb={1}>
              Quick actions
            </Typography>

            <Stack spacing={1}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<RefreshRounded />}
                onClick={() => {
                  loadTicket();
                  loadHistory();
                }}
              >
                Refresh details
              </Button>

              <Button
                fullWidth
                variant="text"
                color="inherit"
                startIcon={<CloseRounded />}
                onClick={() => navigate("/agent/tickets")}
              >
                Back to ticket list
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </Box>
  );
}
