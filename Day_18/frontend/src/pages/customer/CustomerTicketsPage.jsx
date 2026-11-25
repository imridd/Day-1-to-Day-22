
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
  AddRounded,
  SearchRounded,
  RefreshRounded,
  FilterAltOffRounded,
  ConfirmationNumberOutlined
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

function getCreatedDate(ticket) {
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
      label={priority}
      color={colors[priority] || "default"}
      sx={{ textTransform: "capitalize", fontWeight: 700 }}
    />
  );
}

export default function CustomerTicketsPage() {
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

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const myTickets = useMemo(() => {
    if (customerId == null) return [];

    return items.filter((ticket) => {
      const ownerId = getCustomerId(ticket);

      return (
        ownerId != null &&
        String(ownerId) === String(customerId)
      );
    });
  }, [items, customerId]);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return myTickets.filter((ticket) => {
      const matchesSearch =
        !query ||
        [
          getTicketId(ticket),
          getTitle(ticket),
          ticket.description,
          ticket.departmentName,
          ticket.department_name
        ]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        getStatus(ticket) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [myTickets, search, statusFilter]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  if (loading && items.length === 0) {
    return <AppLoader message="Loading your requests..." />;
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
            CUSTOMER SPACE
          </Typography>

          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ fontFamily: "Space Grotesk" }}
          >
            My requests
          </Typography>

          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Follow the progress of your support tickets.
          </Typography>
        </Box>

        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            disabled={loading}
            onClick={() => dispatch(fetchTickets())}
            sx={{ borderRadius: 3 }}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => navigate("/customer/tickets/new")}
            sx={{ borderRadius: 3 }}
          >
            New request
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {typeof error === "string" ? error : "Unable to load your requests."}
        </Alert>
      )}

      {customerId == null && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 3 }}>
          Customer ID was not found in your login data. We need to map the
          correct identifier to filter your requests.
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 2.5,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "2fr 1fr auto"
            },
            gap: 1.5,
            alignItems: "center"
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder="Search by ticket ID or title..."
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

          <Button
            variant="text"
            startIcon={<FilterAltOffRounded />}
            onClick={clearFilters}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1.5}
      >
        <Typography fontWeight={900}>Your tickets</Typography>
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={`${filteredTickets.length} results`}
        />
      </Stack>

      {filteredTickets.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 5,
            textAlign: "center",
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider"
          }}
        >
          <ConfirmationNumberOutlined
            sx={{ fontSize: 48, color: "text.secondary" }}
          />

          <Typography fontWeight={900} mt={1}>
            No requests found
          </Typography>

          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Try another search or create a new support request.
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => navigate("/customer/tickets/new")}
            sx={{ mt: 2 }}
          >
            Create request
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
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                gap={2}
              >
                <Box flex={1} minWidth={0}>
                  <Typography
                    color="primary.main"
                    fontSize={11}
                    fontWeight={900}
                  >
                    REQUEST #{getTicketId(ticket)}
                  </Typography>

                  <Typography fontWeight={900} mt={0.4}>
                    {getTitle(ticket)}
                  </Typography>

                  <Typography color="text.secondary" fontSize={11} mt={0.5}>
                    Submitted {getCreatedDate(ticket)}
                  </Typography>
                </Box>

                <Stack direction="row" gap={1} flexWrap="wrap">
                  <StatusChip status={getStatus(ticket)} />
                  <PriorityChip priority={getPriority(ticket)} />
                </Stack>

                <Button
                  variant="outlined"
                  size="small"
                  onClick={() =>
                    navigate(`/customer/tickets/${getTicketId(ticket)}`)
                  }
                  sx={{ borderRadius: 2.5 }}
                >
                  Track request
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </Box>
  );
}
