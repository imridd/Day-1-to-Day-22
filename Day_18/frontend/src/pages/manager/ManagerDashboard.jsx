
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Grid,
  Stack,
  Typography,
  Paper,
  Avatar,
  Button,
  CircularProgress
} from "@mui/material";

import {
  ConfirmationNumberOutlined,
  PendingActionsOutlined,
  TaskAltOutlined,
  PriorityHighRounded,
  TrendingUpRounded,
  ArrowForwardRounded,
  GroupsOutlined,
  SupportAgentOutlined,
  PeopleAltOutlined,
  BusinessOutlined
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";

import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchTickets } from "../../features/tickets/ticketSlice";

import PageHeader from "../../components/layouts/PageHeader";
import StatusChip from "../../components/common/StatusChip";
import AppLoader from "../../components/common/AppLoader";

const STATUS_COLORS = [
  "#8B5CF6",
  "#F59E0B",
  "#06B6D4",
  "#10B981",
  "#64748B"
];

const PRIORITY_COLORS = {
  urgent: "#EF4444",
  high: "#F97316",
  medium: "#F59E0B",
  low: "#10B981"
};

function getStatus(ticket) {
  return String(ticket.status || "unknown")
    .toLowerCase()
    .replaceAll(" ", "_");
}

function getPriority(ticket) {
  return String(ticket.priority || "medium").toLowerCase();
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <Paper
      elevation={0}
      className="hover-lift"
      sx={{
        p: 2.5,
        height: "100%",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "19px",
        backgroundColor: "background.paper"
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Box>
          <Typography color="text.secondary" fontSize={12} fontWeight={700}>
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
            width: 46,
            height: 46,
            borderRadius: "14px",
            color,
            backgroundColor: `${color}18`
          }}
        >
          {icon}
        </Avatar>
      </Stack>
    </Paper>
  );
}

function QuickAction({ icon, title, description, onClick }) {
  return (
    <Paper
      elevation={0}
      onClick={onClick}
      className="hover-lift"
      sx={{
        p: 2,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: "divider",
        cursor: "pointer",
        backgroundColor: "background.paper"
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Avatar
          sx={{
            bgcolor: "action.hover",
            color: "primary.main",
            borderRadius: "12px"
          }}
        >
          {icon}
        </Avatar>

        <Box flex={1}>
          <Typography fontWeight={800} fontSize={13}>
            {title}
          </Typography>

          <Typography color="text.secondary" variant="caption">
            {description}
          </Typography>
        </Box>

        <ArrowForwardRounded color="action" fontSize="small" />
      </Stack>
    </Paper>
  );
}

export default function ManagerDashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { items = [], loading, error } = useAppSelector(
    (state) => state.tickets
  );

  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const stats = useMemo(() => {
    const total = items.length;

    const resolved = items.filter((ticket) =>
      ["resolved", "closed", "delivered"].includes(getStatus(ticket))
    ).length;

    const urgent = items.filter((ticket) =>
      ["urgent", "high"].includes(getPriority(ticket))
    ).length;

    const open = items.filter((ticket) =>
      ["open", "created", "new", "pending", "in_progress", "in progress"].includes(
        getStatus(ticket)
      )
    ).length;

    return { total, resolved, urgent, open };
  }, [items]);

  const statusData = useMemo(() => {
    const counts = {};

    items.forEach((ticket) => {
      const status = getStatus(ticket);
      counts[status] = (counts[status] || 0) + 1;
    });

    return Object.entries(counts).map(([name, value]) => ({
      name: name.replaceAll("_", " "),
      value
    }));
  }, [items]);

  const priorityData = useMemo(() => {
    const priorities = ["urgent", "high", "medium", "low"];

    return priorities.map((priority) => ({
      name: priority.charAt(0).toUpperCase() + priority.slice(1),
      count: items.filter(
        (ticket) => getPriority(ticket) === priority
      ).length,
      fill: PRIORITY_COLORS[priority]
    }));
  }, [items]);

  const recentTickets = useMemo(() => {
    return [...items]
      .sort((a, b) => {
        const dateA = new Date(
          a.createdAt || a.created_at || 0
        ).getTime();

        const dateB = new Date(
          b.createdAt || b.created_at || 0
        ).getTime();

        return dateB - dateA;
      })
      .slice(0, 5);
  }, [items]);

  if (loading && items.length === 0) {
    return <AppLoader message="Loading manager dashboard..." />;
  }

  return (
    <Box>
      <PageHeader
        eyebrow="MANAGER WORKSPACE"
        title="Dashboard overview"
        subtitle={`Welcome back, ${user?.name || user?.fullName || "Manager"}. Here's what's happening today.`}
      />

      {error && (
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "error.main"
          }}
        >
          <Typography color="error" fontSize={13}>
            Unable to load ticket data. {typeof error === "string" ? error : ""}
          </Typography>

          <Button
            size="small"
            onClick={() => dispatch(fetchTickets())}
          >
            Retry
          </Button>
        </Paper>
      )}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="TOTAL TICKETS"
            value={stats.total}
            subtitle="Tickets currently available"
            icon={<ConfirmationNumberOutlined />}
            color="#8B5CF6"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="OPEN TICKETS"
            value={stats.open}
            subtitle="Awaiting completion"
            icon={<PendingActionsOutlined />}
            color="#F59E0B"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="RESOLVED TICKETS"
            value={stats.resolved}
            subtitle="Resolved or closed"
            icon={<TaskAltOutlined />}
            color="#10B981"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="HIGH PRIORITY"
            value={stats.urgent}
            subtitle="Urgent and high priority"
            icon={<PriorityHighRounded />}
            color="#EF4444"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: 350,
              borderRadius: "19px",
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Typography fontWeight={800} mb={0.5}>
              Ticket status overview
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Distribution of tickets by their current status
            </Typography>

            {statusData.length === 0 ? (
              <Box
                height="80%"
                display="grid"
                sx={{ placeItems: "center" }}
              >
                <Typography color="text.secondary" fontSize={13}>
                  No ticket data available yet.
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={65}
                    paddingAngle={4}
                  >
                    {statusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={STATUS_COLORS[index % STATUS_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              height: 350,
              borderRadius: "19px",
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Typography fontWeight={800} mb={0.5}>
              Priority breakdown
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Tickets grouped by priority
            </Typography>

            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={priorityData}
                margin={{ top: 20, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.2}
                />

                <XAxis dataKey="name" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />

                <Bar dataKey="count" radius={[7, 7, 0, 0]}>
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "19px",
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Box>
                <Typography fontWeight={800}>
                  Recent tickets
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Latest support requests
                </Typography>
              </Box>

              <Button
                size="small"
                endIcon={<ArrowForwardRounded />}
                onClick={() => navigate("/manager/tickets")}
              >
                View all
              </Button>
            </Stack>

            {recentTickets.length === 0 ? (
              <Typography
                color="text.secondary"
                textAlign="center"
                py={5}
                fontSize={13}
              >
                No tickets found.
              </Typography>
            ) : (
              <Stack spacing={1}>
                {recentTickets.map((ticket, index) => (
                  <Box
                    key={ticket.ticketId ?? ticket.id ?? index}
                    sx={{
                      p: 1.5,
                      borderRadius: "13px",
                      backgroundColor: "action.hover",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                      flexWrap: "wrap"
                    }}
                  >
                    <Box flex={1} minWidth={150}>
                      <Typography
                        variant="caption"
                        color="primary.main"
                        fontWeight={800}
                      >
                        #{ticket.ticketId ?? ticket.id ?? "N/A"}
                      </Typography>

                      <Typography fontWeight={700} fontSize={13}>
                        {ticket.title || ticket.subject || "Untitled ticket"}
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {ticket.customerName || ticket.customer_name || "Customer"}
                      </Typography>
                    </Box>

                    <Stack
                      direction="row"
                      gap={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
                      <StatusChip status={ticket.priority} />
                      <StatusChip status={ticket.status} />
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: "19px",
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Typography fontWeight={800} mb={0.5}>
              Quick actions
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Jump into management
            </Typography>

            <Stack spacing={1.5} mt={2}>
              <QuickAction
                icon={<ConfirmationNumberOutlined />}
                title="Manage tickets"
                description="Review and assign tickets"
                onClick={() => navigate("/manager/tickets")}
              />

              <QuickAction
                icon={<SupportAgentOutlined />}
                title="Manage agents"
                description="View your support team"
                onClick={() => navigate("/manager/agents")}
              />

              <QuickAction
                icon={<PeopleAltOutlined />}
                title="Customers"
                description="Manage customer records"
                onClick={() => navigate("/manager/customers")}
              />

              <QuickAction
                icon={<BusinessOutlined />}
                title="Departments"
                description="Manage departments"
                onClick={() => navigate("/manager/departments")}
              />
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
