
import { useEffect, useMemo } from "react";

import {
  Alert,
  Box,
  Grid,
  Paper,
  Stack,
  Typography
} from "@mui/material";

import {
  ConfirmationNumberOutlined,
  TaskAltRounded,
  PendingActionsRounded,
  PriorityHighRounded,
  TrendingUpRounded
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from "recharts";

import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchTickets } from "../../features/tickets/ticketSlice";
import AppLoader from "../../components/common/AppLoader";

const CHART_COLORS = [
  "#8B5CF6",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#64748B"
];

const PRIORITY_COLORS = {
  urgent: "#EF4444",
  high: "#F97316",
  medium: "#F59E0B",
  low: "#10B981"
};

function normalizeStatus(ticket) {
  return String(ticket.status ?? "unknown")
    .toLowerCase()
    .replaceAll("_", " ")
    .trim();
}

function normalizePriority(ticket) {
  return String(ticket.priority ?? "medium")
    .toLowerCase()
    .trim();
}

function getCreatedDate(ticket) {
  const value = ticket.createdAt ?? ticket.created_at;

  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function getDepartment(ticket) {
  return (
    ticket.departmentName ??
    ticket.department_name ??
    ticket.department?.name ??
    ticket.departmentId ??
    ticket.department_id ??
    null
  );
}

function AnalyticsStat({ title, value, caption, icon, color }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: "18px",
        border: "1px solid",
        borderColor: "divider",
        height: "100%"
      }}
    >
      <Stack direction="row" justifyContent="space-between">
        <Box>
          <Typography
            color="text.secondary"
            fontSize={12}
            fontWeight={700}
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
            {caption}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 45,
            height: 45,
            display: "grid",
            placeItems: "center",
            borderRadius: "14px",
            color,
            bgcolor: `${color}18`
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function ChartPanel({ title, subtitle, children, height = 350 }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        height,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "19px"
      }}
    >
      <Typography fontWeight={800}>
        {title}
      </Typography>

      <Typography
        variant="caption"
        color="text.secondary"
        display="block"
        mb={2}
      >
        {subtitle}
      </Typography>

      {children}
    </Paper>
  );
}

export default function ManagerAnalyticsPage() {
  const dispatch = useAppDispatch();

  const {
    items = [],
    loading,
    error
  } = useAppSelector((state) => state.tickets);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const analytics = useMemo(() => {
    const total = items.length;

    const resolvedTickets = items.filter((ticket) =>
      ["resolved", "closed"].includes(normalizeStatus(ticket))
    );

    const openTickets = items.filter((ticket) =>
      ["open", "new", "created", "pending", "in progress"].includes(
        normalizeStatus(ticket)
      )
    );

    const highPriorityTickets = items.filter((ticket) =>
      ["urgent", "high"].includes(normalizePriority(ticket))
    );

    const resolutionRate = total
      ? Math.round((resolvedTickets.length / total) * 100)
      : 0;

    // Build the last seven local calendar days.
    const today = new Date();
    const dailyCounts = [];

    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date(today);
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - offset);

      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);

      const count = items.filter((ticket) => {
        const created = getCreatedDate(ticket);

        return created && created >= date && created < nextDay;
      }).length;

      dailyCounts.push({
        day: date.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric"
        }),
        tickets: count
      });
    }

    const statusCounts = {};

    items.forEach((ticket) => {
      const status = normalizeStatus(ticket);
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    const statusData = Object.entries(statusCounts).map(
      ([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
      })
    );

    const priorityData = ["urgent", "high", "medium", "low"].map(
      (priority) => ({
        name: priority.charAt(0).toUpperCase() + priority.slice(1),
        tickets: items.filter(
          (ticket) => normalizePriority(ticket) === priority
        ).length,
        fill: PRIORITY_COLORS[priority]
      })
    );

    const departmentCounts = {};

    items.forEach((ticket) => {
      const department = getDepartment(ticket);

      if (department !== null && department !== undefined && department !== "") {
        const name = String(department);
        departmentCounts[name] = (departmentCounts[name] || 0) + 1;
      }
    });

    const departmentData = Object.entries(departmentCounts)
      .map(([name, tickets]) => ({ name, tickets }))
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 7);

    return {
      total,
      resolved: resolvedTickets.length,
      open: openTickets.length,
      highPriority: highPriorityTickets.length,
      resolutionRate,
      dailyCounts,
      statusData,
      priorityData,
      departmentData
    };
  }, [items]);

  if (loading && items.length === 0) {
    return <AppLoader message="Preparing analytics..." />;
  }

  return (
    <Box>
      <Box mb={3}>
        <Typography
          variant="overline"
          color="primary.main"
          fontWeight={800}
          letterSpacing={2}
        >
          INSIGHTS & REPORTING
        </Typography>

        <Typography
          variant="h4"
          fontWeight={900}
          sx={{ fontFamily: "Space Grotesk" }}
        >
          Analytics
        </Typography>

        <Typography color="text.secondary" fontSize={13} mt={0.5}>
          Understand ticket activity and support workload.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {typeof error === "string"
            ? error
            : "Unable to load analytics data."}
        </Alert>
      )}

      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsStat
            title="TOTAL TICKETS"
            value={analytics.total}
            caption="Tickets in fetched data"
            icon={<ConfirmationNumberOutlined />}
            color="#8B5CF6"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsStat
            title="RESOLVED"
            value={analytics.resolved}
            caption="Resolved and closed"
            icon={<TaskAltRounded />}
            color="#10B981"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsStat
            title="OPEN / PENDING"
            value={analytics.open}
            caption="Currently unfinished statuses"
            icon={<PendingActionsRounded />}
            color="#F59E0B"
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <AnalyticsStat
            title="HIGH PRIORITY"
            value={analytics.highPriority}
            caption="Urgent and high priority"
            icon={<PriorityHighRounded />}
            color="#EF4444"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} lg={8}>
          <ChartPanel
            title="Ticket activity"
            subtitle="Tickets created per day over the last seven calendar days"
            height={370}
          >
            <ResponsiveContainer width="100%" height="85%">
              <AreaChart
                data={analytics.dailyCounts}
                margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="ticketGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.2}
                />

                <XAxis dataKey="day" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />

                <Area
                  type="monotone"
                  dataKey="tickets"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  fill="url(#ticketGradient)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>

        <Grid item xs={12} lg={4}>
          <ChartPanel
            title="Resolution rate"
            subtitle="Resolved or closed tickets divided by total fetched tickets"
            height={370}
          >
            <Box
              height="85%"
              display="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Box
                sx={{
                  width: 170,
                  height: 170,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: `conic-gradient(#10B981 ${analytics.resolutionRate * 3.6}deg, rgba(148,163,184,0.17) 0deg)`
                }}
              >
                <Box
                  sx={{
                    width: 135,
                    height: 135,
                    borderRadius: "50%",
                    bgcolor: "background.paper",
                    display: "grid",
                    placeItems: "center"
                  }}
                >
                  <Box textAlign="center">
                    <Typography
                      variant="h4"
                      fontWeight={900}
                      sx={{ fontFamily: "Space Grotesk" }}
                    >
                      {analytics.resolutionRate}%
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Resolved
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Stack direction="row" gap={3} mt={3}>
                <Box textAlign="center">
                  <Typography fontWeight={900}>
                    {analytics.resolved}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Resolved
                  </Typography>
                </Box>

                <Box textAlign="center">
                  <Typography fontWeight={900}>
                    {analytics.total - analytics.resolved}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Not resolved
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </ChartPanel>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ChartPanel
            title="Status distribution"
            subtitle="How tickets are currently distributed"
          >
            {analytics.statusData.length === 0 ? (
              <Box height="80%" display="grid" sx={{ placeItems: "center" }}>
                <Typography color="text.secondary" fontSize={13}>
                  No ticket data available.
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie
                    data={analytics.statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={105}
                    innerRadius={60}
                    paddingAngle={3}
                  >
                    {analytics.statusData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartPanel>
        </Grid>

        <Grid item xs={12} md={6}>
          <ChartPanel
            title="Priority distribution"
            subtitle="Number of tickets at each priority level"
          >
            <ResponsiveContainer width="100%" height="85%">
              <BarChart
                data={analytics.priorityData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.2}
                />

                <XAxis dataKey="name" fontSize={11} />
                <YAxis allowDecimals={false} fontSize={11} />
                <Tooltip />

                <Bar
                  dataKey="tickets"
                  radius={[7, 7, 0, 0]}
                >
                  {analytics.priorityData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.fill}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartPanel>
        </Grid>

        <Grid item xs={12}>
          <ChartPanel
            title="Department workload"
            subtitle="Ticket counts grouped by available department information"
            height={380}
          >
            {analytics.departmentData.length === 0 ? (
              <Box height="80%" display="grid" sx={{ placeItems: "center" }}>
                <Typography color="text.secondary" fontSize={13}>
                  Department information is not available in the fetched tickets.
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart
                  data={analytics.departmentData}
                  layout="vertical"
                  margin={{ top: 5, right: 25, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    opacity={0.2}
                  />

                  <XAxis type="number" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    fontSize={11}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="tickets"
                    fill="#8B5CF6"
                    radius={[0, 7, 7, 0]}
                    barSize={23}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartPanel>
        </Grid>
      </Grid>

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
        <Stack direction="row" gap={1} alignItems="center">
          <TrendingUpRounded color="primary" />

          <Typography fontSize={12} color="text.secondary">
            Analytics are calculated from the tickets currently returned by
            your API. If your backend uses pagination, these figures may
            represent only the fetched page. This page does not yet calculate
            actual agent productivity, average resolution time or SLA
            compliance.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
