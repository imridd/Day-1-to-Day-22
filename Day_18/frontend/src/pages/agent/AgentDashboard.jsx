
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
  ConfirmationNumberOutlined,
  TaskAltRounded,
  PendingActionsRounded,
  PriorityHighRounded,
  ArrowForwardRounded,
  RefreshRounded,
  SupportAgentOutlined
} from "@mui/icons-material";

import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchTickets } from "../../features/tickets/ticketSlice";
import AppLoader from "../../components/common/AppLoader";

function getTicketId(ticket) {
  return ticket.ticketId ?? ticket.ticket_id ?? ticket.id ?? "N/A";
}

function getTicketTitle(ticket) {
  return ticket.title ?? ticket.subject ?? "Untitled ticket";
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

function getAssignedAgentId(ticket) {
  return (
    ticket.agentId ??
    ticket.agent_id ??
    ticket.assignedAgentId ??
    ticket.assigned_agent_id ??
    ticket.assignedTo?.agentId ??
    ticket.assignedTo?.id ??
    ticket.agent?.agentId ??
    ticket.agent?.id ??
    null
  );
}

function getCreatedDate(ticket) {
  const value = ticket.createdAt ?? ticket.created_at;

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short"
  });
}

function MetricCard({ title, value, subtitle, icon, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height: "100%",
        borderRadius: "18px",
        border: "1px solid",
        borderColor: "divider"
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Box>
          <Typography
            fontSize={12}
            fontWeight={700}
            color="text.secondary"
          >
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

          <Typography
            variant="caption"
            color="text.secondary"
            display="block"
            mt={1}
          >
            {subtitle}
          </Typography>
        </Box>

        <Avatar
          sx={{
            width: 45,
            height: 45,
            borderRadius: "14px",
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

function StatusBadge({ status }) {
  let color = "default";

  if (["resolved", "closed"].includes(status)) {
    color = "success";
  } else if (["open", "new", "created"].includes(status)) {
    color = "info";
  } else if (["pending", "in progress"].includes(status)) {
    color = "warning";
  }

  return (
    <Chip
      size="small"
      color={color}
      label={status}
      variant="outlined"
      sx={{ textTransform: "capitalize", fontWeight: 700 }}
    />
  );
}

function PriorityBadge({ priority }) {
  const colors = {
    urgent: "error",
    high: "warning",
    medium: "info",
    low: "success"
  };

  return (
    <Chip
      size="small"
      color={colors[priority] || "default"}
      label={priority}
      sx={{ textTransform: "capitalize", fontWeight: 700 }}
    />
  );
}

export default function AgentDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);

  const {
    items = [],
    loading,
    error
  } = useAppSelector((state) => state.tickets);

  const currentAgentId =
    user?.agentId ??
    user?.agent_id ??
    user?.id ??
    user?.userId;

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const assignedTickets = useMemo(() => {
    if (currentAgentId == null) return [];

    return items.filter((ticket) => {
      const assignedId = getAssignedAgentId(ticket);

      return (
        assignedId != null &&
        String(assignedId) === String(currentAgentId)
      );
    });
  }, [items, currentAgentId]);

  const stats = useMemo(() => {
    const resolved = assignedTickets.filter((ticket) =>
      ["resolved", "closed"].includes(getStatus(ticket))
    ).length;

    const open = assignedTickets.filter((ticket) =>
      ["open", "new", "created", "pending", "in progress"].includes(
        getStatus(ticket)
      )
    ).length;

    const highPriority = assignedTickets.filter((ticket) =>
      ["urgent", "high"].includes(getPriority(ticket))
    ).length;

    return {
      total: assignedTickets.length,
      resolved,
      open,
      highPriority
    };
  }, [assignedTickets]);

  const recentTickets = useMemo(() => {
    return [...assignedTickets]
      .sort((a, b) => {
        const dateA = new Date(
          a.createdAt ?? a.created_at ?? 0
        ).getTime();

        const dateB = new Date(
          b.createdAt ?? b.created_at ?? 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 6);
  }, [assignedTickets]);

  if (loading && items.length === 0) {
    return <AppLoader message="Loading your workspace..." />;
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
            AGENT WORKSPACE
          </Typography>

          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ fontFamily: "Space Grotesk" }}
          >
            Hey, {user?.name || user?.fullName || "Agent"} 👋
          </Typography>

          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Here's your support workload at a glance.
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
          {typeof error === "string"
            ? error
            : "Unable to load your tickets. Please retry."}
        </Alert>
      )}

      {currentAgentId == null && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
          Your login response does not expose an agent ID that this dashboard
          recognizes. Assigned-ticket counts may be unavailable until we map
          the actual user response.
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 2.5,
          borderRadius: "19px",
          background:
            "linear-gradient(115deg, rgba(139,92,246,0.16), rgba(6,182,212,0.08))",
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
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
              <SupportAgentOutlined />
            </Avatar>

            <Box>
              <Typography fontWeight={900}>
                Your support workspace
              </Typography>

              <Typography color="text.secondary" fontSize={12}>
                Stay on top of your assigned support requests.
              </Typography>
            </Box>
          </Stack>

          <Button
            variant="contained"
            endIcon={<ArrowForwardRounded />}
            onClick={() => navigate("/agent/tickets")}
          >
            View my tickets
          </Button>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))"
          },
          gap: 2,
          mb: 3
        }}
      >
        <MetricCard
          title="ASSIGNED TICKETS"
          value={stats.total}
          subtitle="Assigned to you"
          icon={<ConfirmationNumberOutlined />}
          color="#8B5CF6"
        />

        <MetricCard
          title="OPEN / PENDING"
          value={stats.open}
          subtitle="Work still in progress"
          icon={<PendingActionsRounded />}
          color="#F59E0B"
        />

        <MetricCard
          title="RESOLVED"
          value={stats.resolved}
          subtitle="Resolved or closed"
          icon={<TaskAltRounded />}
          color="#10B981"
        />

        <MetricCard
          title="HIGH PRIORITY"
          value={stats.highPriority}
          subtitle="Urgent and high"
          icon={<PriorityHighRounded />}
          color="#EF4444"
        />
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          borderRadius: "19px",
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
              Your recent tickets
            </Typography>

            <Typography color="text.secondary" variant="caption">
              Latest tickets assigned to you
            </Typography>
          </Box>

          <Button
            size="small"
            endIcon={<ArrowForwardRounded />}
            onClick={() => navigate("/agent/tickets")}
          >
            View all
          </Button>
        </Stack>

        {recentTickets.length === 0 ? (
          <Box py={6} textAlign="center">
            <ConfirmationNumberOutlined
              sx={{ fontSize: 45, color: "text.secondary" }}
            />

            <Typography fontWeight={800} mt={1}>
              No assigned tickets found
            </Typography>

            <Typography
              color="text.secondary"
              fontSize={12}
              mt={0.5}
            >
              Tickets assigned to your agent account will appear here.
            </Typography>
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
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 2,
                  flexWrap: "wrap"
                }}
              >
                <Box flex={1} minWidth={150}>
                  <Typography
                    color="primary.main"
                    fontSize={11}
                    fontWeight={900}
                  >
                    #{getTicketId(ticket)}
                  </Typography>

                  <Typography fontWeight={800} fontSize={13}>
                    {getTicketTitle(ticket)}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    variant="caption"
                  >
                    Created {getCreatedDate(ticket)}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  gap={1}
                  alignItems="center"
                  flexWrap="wrap"
                >
                  <PriorityBadge priority={getPriority(ticket)} />
                  <StatusBadge status={getStatus(ticket)} />
                </Stack>

                <Button
                  size="small"
                  onClick={() =>
                    navigate(`/agent/tickets/${getTicketId(ticket)}`)
                  }
                >
                  Open
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
        <Typography fontSize={12} color="text.secondary">
          Dashboard counts are based on the tickets returned by the API and
          matched against your agent ID. If the backend uses a different
          assignment field or paginates results, we'll adjust this during
          integration testing.
        </Typography>
      </Paper>
    </Box>
  );
}
