
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import {
  AddRounded,
  ConfirmationNumberOutlined,
  PendingActionsRounded,
  TaskAltRounded,
  ArrowForwardRounded,
  RefreshRounded,
  SupportAgentRounded
} from "@mui/icons-material";

import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchTickets } from "../../features/tickets/ticketSlice";
import AppLoader from "../../components/common/AppLoader";

function getTicketId(ticket) {
  return ticket.ticketId ?? ticket.ticket_id ?? ticket.id ?? "N/A";
}

function getTitle(ticket) {
  return ticket.title ?? ticket.subject ?? "Untitled request";
}

function getStatus(ticket) {
  return String(ticket.status ?? "unknown")
    .toLowerCase()
    .replaceAll("_", " ")
    .trim();
}

function getPriority(ticket) {
  return String(ticket.priority ?? "medium").toLowerCase();
}

function getCustomerId(ticket) {
  return (
    ticket.customerId ??
    ticket.customer_id ??
    ticket.customer?.customerId ??
    ticket.customer?.customer_id ??
    ticket.customer?.id ??
    null
  );
}

function getDate(ticket) {
  const value = ticket.createdAt ?? ticket.created_at;

  if (!value) return "—";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
}

function MetricCard({ title, value, caption, icon, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 4,
        height: "100%",
        border: "1px solid",
        borderColor: "divider"
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Box>
          <Typography fontSize={12} color="text.secondary" fontWeight={700}>
            {title}
          </Typography>
          <Typography
            variant="h4"
            fontWeight={900}
            mt={1}
            sx={{ fontFamily: "Space Grotesk" }}
          >
            {value}
          </Typography>
          <Typography fontSize={11} color="text.secondary" mt={1}>
            {caption}
          </Typography>
        </Box>

        <Avatar
          sx={{
            width: 45,
            height: 45,
            borderRadius: 3,
            color,
            bgcolor: `${color}18`
          }}
        >
          {icon}
        </Avatar>
      </Stack>
    </Paper>
  );
}

function StatusChip({ status }) {
  const color = ["resolved", "closed"].includes(status)
    ? "success"
    : ["pending", "in progress"].includes(status)
      ? "warning"
      : status === "unknown"
        ? "default"
        : "info";

  return (
    <Chip
      size="small"
      label={status}
      color={color}
      variant="outlined"
      sx={{ textTransform: "capitalize", fontWeight: 700 }}
    />
  );
}

export default function CustomerDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);

  const {
    items = [],
    loading,
    error
  } = useAppSelector((state) => state.tickets);

  const customerId =
    user?.customerId ??
    user?.customer_id ??
    user?.id ??
    user?.userId;

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const myTickets = useMemo(() => {
    if (customerId == null) return [];

    return items.filter((ticket) => {
      const ticketCustomerId = getCustomerId(ticket);

      return (
        ticketCustomerId != null &&
        String(ticketCustomerId) === String(customerId)
      );
    });
  }, [items, customerId]);

  const stats = useMemo(() => {
    const resolved = myTickets.filter((ticket) =>
      ["resolved", "closed"].includes(getStatus(ticket))
    ).length;

    const active = myTickets.filter((ticket) =>
      !["resolved", "closed"].includes(getStatus(ticket))
    ).length;

    return {
      total: myTickets.length,
      active,
      resolved
    };
  }, [myTickets]);

  const recentTickets = useMemo(() => {
    return [...myTickets]
      .sort((a, b) => {
        const first = new Date(a.createdAt ?? a.created_at ?? 0).getTime();
        const second = new Date(b.createdAt ?? b.created_at ?? 0).getTime();
        return second - first;
      })
      .slice(0, 5);
  }, [myTickets]);

  if (loading && items.length === 0) {
    return <AppLoader message="Loading your dashboard..." />;
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="overline"
            color="primary.main"
            fontWeight={800}
            letterSpacing={2}
          >
            CUSTOMER SPACE
          </Typography>

          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ fontFamily: "Space Grotesk" }}
          >
            Welcome, {user?.name || user?.fullName || "there"} 👋
          </Typography>

          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Your support requests, all in one place.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshRounded />}
          disabled={loading}
          onClick={() => dispatch(fetchTickets())}
          sx={{ borderRadius: 3 }}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {typeof error === "string" ? error : "Unable to load your requests."}
        </Alert>
      )}

      {customerId == null && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
          Customer ID is missing from the login response. We need to map the
          correct customer identifier before filtering requests.
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: 2.5,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          background:
            "linear-gradient(115deg, rgba(139,92,246,0.16), rgba(6,182,212,0.08))"
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
        >
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Avatar
              sx={{
                width: 52,
                height: 52,
                bgcolor: "primary.main"
              }}
            >
              <SupportAgentRounded />
            </Avatar>

            <Box>
              <Typography fontWeight={900}>
                Need a hand?
              </Typography>
              <Typography color="text.secondary" fontSize={12}>
                Create a support request and our team will help.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => navigate("/customer/tickets/new")}
            sx={{ borderRadius: 3 }}
          >
            Create ticket
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(3, minmax(0, 1fr))"
          },
          gap: 2,
          mb: 3
        }}
      >
        <MetricCard
          title="TOTAL REQUESTS"
          value={stats.total}
          caption="Requests you've submitted"
          icon={<ConfirmationNumberOutlined />}
          color="#8B5CF6"
        />

        <MetricCard
          title="ACTIVE REQUESTS"
          value={stats.active}
          caption="Not yet resolved or closed"
          icon={<PendingActionsRounded />}
          color="#F59E0B"
        />

        <MetricCard
          title="RESOLVED"
          value={stats.resolved}
          caption="Completed requests"
          icon={<TaskAltRounded />}
          color="#10B981"
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={2}
        >
          <Box>
            <Typography fontWeight={900}>
              Recent requests
            </Typography>
            <Typography fontSize={11} color="text.secondary">
              Keep track of your latest support requests.
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowForwardRounded />}
            onClick={() => navigate("/customer/tickets")}
          >
            View all
          </Button>
        </Stack>

        {recentTickets.length === 0 ? (
          <Box py={5} textAlign="center">
            <ConfirmationNumberOutlined
              sx={{ fontSize: 45, color: "text.secondary" }}
            />
            <Typography fontWeight={800} mt={1}>
              No requests yet
            </Typography>
            <Typography color="text.secondary" fontSize={12} mt={0.5}>
              Your submitted support tickets will appear here.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddRounded />}
              onClick={() => navigate("/customer/tickets/new")}
              sx={{ mt: 2 }}
            >
              Create your first ticket
            </Button>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {recentTickets.map((ticket, index) => (
              <Box
                key={getTicketId(ticket) ?? index}
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                  bgcolor: "action.hover",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1.5
                }}
              >
                <Box flex={1} minWidth={150}>
                  <Typography
                    fontSize={11}
                    fontWeight={900}
                    color="primary.main"
                  >
                    #{getTicketId(ticket)}
                  </Typography>

                  <Typography fontSize={13} fontWeight={800}>
                    {getTitle(ticket)}
                  </Typography>

                  <Typography color="text.secondary" fontSize={11}>
                    Created {getDate(ticket)}
                  </Typography>
                </Box>

                <StatusChip status={getStatus(ticket)} />

                <Button
                  size="small"
                  onClick={() =>
                    navigate(`/customer/tickets/${getTicketId(ticket)}`)
                  }
                >
                  View
                </Button>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mt: 2,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <Typography fontSize={11} color="text.secondary">
          Your dashboard uses the tickets returned by the API and matches
          their customer ID against your logged-in account. If the API returns
          paginated results, these counts reflect only the records currently
          loaded.
        </Typography>
      </Paper>
    </Box>
  );
}
