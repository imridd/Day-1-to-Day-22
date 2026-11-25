
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  SearchRounded,
  RefreshRounded,
  ConfirmationNumberOutlined,
  FilterAltOffRounded
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

function getTicketDescription(ticket) {
  return ticket.description ?? ticket.details ?? "";
}

function getStatus(ticket) {
  return String(ticket.status ?? "unknown").toLowerCase().replaceAll("_", " ");
}

function getPriority(ticket) {
  return String(ticket.priority ?? "medium").toLowerCase();
}

function getAgentId(ticket) {
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

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString("en-IN");
}

function PriorityChip({ priority }) {
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

function StatusChip({ status }) {
  const colors = {
    open: "info",
    new: "info",
    created: "info",
    pending: "warning",
    "in progress": "warning",
    resolved: "success",
    closed: "success"
  };

  return (
    <Chip
      size="small"
      color={colors[status] || "default"}
      label={status}
      variant="outlined"
      sx={{ textTransform: "capitalize", fontWeight: 700 }}
    />
  );
}

export default function AgentTicketsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector((state) => state.auth.user);

  const {
    items = [],
    loading,
    error
  } = useAppSelector((state) => state.tickets);

  const agentId =
    user?.agentId ??
    user?.agent_id ??
    user?.id ??
    user?.userId;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const assignedTickets = useMemo(() => {
    if (agentId == null) return [];

    return items.filter((ticket) => {
      const assignedId = getAgentId(ticket);

      return (
        assignedId != null &&
        String(assignedId) === String(agentId)
      );
    });
  }, [items, agentId]);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assignedTickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        [
          getTicketId(ticket),
          getTicketTitle(ticket),
          getTicketDescription(ticket),
          ticket.customerName,
          ticket.customer_name,
          ticket.customer?.name
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        getStatus(ticket) === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        getPriority(ticket) === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [assignedTickets, search, statusFilter, priorityFilter]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  if (loading && items.length === 0) {
    return <AppLoader message="Loading your tickets..." />;
  }

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
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
            My tickets
          </Typography>

          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Manage and track the tickets assigned to you.
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
            : "Unable to load tickets."}
        </Alert>
      )}

      {agentId == null && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
          Agent ID is missing from the current login response. We need to map
          the correct field before assigned-ticket filtering can work.
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 4
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "2fr 1fr 1fr auto"
            },
            gap: 1.5,
            alignItems: "center"
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search by ID, title, description..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <SearchRounded
                  fontSize="small"
                  sx={{ mr: 1, color: "text.secondary" }}
                />
              )
            }}
          />

          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <MenuItem value="all">All statuses</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in progress">In progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              label="Priority"
              onChange={(event) => setPriorityFilter(event.target.value)}
            >
              <MenuItem value="all">All priorities</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="text"
            startIcon={<FilterAltOffRounded />}
            onClick={resetFilters}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={1.5}
      >
        <Typography fontWeight={900}>
          Assigned tickets
        </Typography>

        <Chip
          label={`${filteredTickets.length} results`}
          size="small"
          color="primary"
          variant="outlined"
        />
      </Stack>

      {filteredTickets.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4
          }}
        >
          <ConfirmationNumberOutlined
            sx={{ fontSize: 48, color: "text.secondary" }}
          />

          <Typography fontWeight={900} mt={1}>
            No tickets found
          </Typography>

          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Try changing your filters or check whether tickets are assigned
            to your account.
          </Typography>

          <Button sx={{ mt: 2 }} onClick={resetFilters}>
            Clear filters
          </Button>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {filteredTickets.map((ticket, index) => (
            <Paper
              key={getTicketId(ticket) ?? index}
              elevation={0}
              sx={{
                p: { xs: 1.75, sm: 2.25 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                transition: "transform .2s, border-color .2s",
                "&:hover": {
                  transform: "translateY(-2px)",
                  borderColor: "primary.main"
                }
              }}
            >
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={2}
              >
                <Box flex={1} minWidth={0}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    gap={1}
                    mb={0.75}
                  >
                    <Typography
                      color="primary.main"
                      fontWeight={900}
                      fontSize={12}
                    >
                      #{getTicketId(ticket)}
                    </Typography>

                    <Typography
                      color="text.secondary"
                      fontSize={11}
                    >
                      {getCreatedDate(ticket)}
                    </Typography>
                  </Stack>

                  <Typography
                    fontWeight={900}
                    fontSize={15}
                    sx={{ overflowWrap: "anywhere" }}
                  >
                    {getTicketTitle(ticket)}
                  </Typography>

                  <Typography
                    color="text.secondary"
                    fontSize={12}
                    mt={0.5}
                    sx={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden"
                    }}
                  >
                    {getTicketDescription(ticket) ||
                      "No description provided."}
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  alignItems="center"
                  gap={1}
                  flexWrap="wrap"
                >
                  <PriorityChip priority={getPriority(ticket)} />
                  <StatusChip status={getStatus(ticket)} />

                  <Button
                    variant="contained"
                    size="small"
                    onClick={() =>
                      navigate(`/agent/tickets/${getTicketId(ticket)}`)
                    }
                    sx={{ borderRadius: 2.5 }}
                  >
                    View
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
