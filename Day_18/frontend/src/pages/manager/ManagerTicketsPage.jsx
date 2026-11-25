import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";

import {
  SearchRounded,
  FilterAltOffRounded,
  VisibilityRounded,
  ConfirmationNumberOutlined,
  RefreshRounded,
  CloseRounded
} from "@mui/icons-material";

import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchTickets } from "../../features/tickets/ticketSlice";

const getTicketId = (ticket) =>
  ticket.ticketId ?? ticket.ticket_id ?? ticket.id ?? "N/A";

const getTitle = (ticket) =>
  ticket.title ?? ticket.subject ?? "Untitled ticket";

const getStatus = (ticket) =>
  String(ticket.status ?? "Unknown").toLowerCase().replaceAll("_", " ");

const getPriority = (ticket) =>
  String(ticket.priority ?? "Medium").toLowerCase();

const getCustomer = (ticket) =>
  ticket.customerName ??
  ticket.customer_name ??
  ticket.customer?.name ??
  ticket.customerEmail ??
  ticket.customer_email ??
  "Unknown customer";

const getAgent = (ticket) =>
  ticket.agentName ??
  ticket.agent_name ??
  ticket.agent?.name ??
  "Unassigned";

const getDate = (ticket) => {
  const value = ticket.createdAt ?? ticket.created_at;

  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
};

function PriorityChip({ priority }) {
  const colors = {
    urgent: "error",
    high: "warning",
    medium: "info",
    low: "success"
  };

  return (
    <Chip
      label={priority}
      size="small"
      color={colors[priority] || "default"}
      sx={{
        textTransform: "capitalize",
        fontWeight: 700,
        minWidth: 75
      }}
    />
  );
}

function TicketStatusChip({ status }) {
  const normalized = status.toLowerCase();

  let color = "default";

  if (["resolved", "closed", "delivered"].includes(normalized)) {
    color = "success";
  } else if (["open", "created", "new"].includes(normalized)) {
    color = "info";
  } else if (
    ["pending", "in progress", "in_progress", "scheduled"].includes(normalized)
  ) {
    color = "warning";
  }

  return (
    <Chip
      label={status}
      color={color}
      size="small"
      variant="outlined"
      sx={{
        textTransform: "capitalize",
        fontWeight: 700
      }}
    />
  );
}

function DetailRow({ label, value }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        gap: 2,
        py: 1.5,
        borderBottom: "1px solid",
        borderColor: "divider"
      }}
    >
      <Typography color="text.secondary" fontSize={13}>
        {label}
      </Typography>

      <Typography
        fontSize={13}
        fontWeight={700}
        textAlign="right"
        sx={{ overflowWrap: "anywhere" }}
      >
        {value || "—"}
      </Typography>
    </Box>
  );
}

export default function ManagerTicketsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const {
    items = [],
    loading,
    error
  } = useAppSelector((state) => state.tickets);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    dispatch(fetchTickets());
  }, [dispatch]);

  const availableStatuses = useMemo(() => {
    return [
      ...new Set(items.map((ticket) => getStatus(ticket)))
    ].sort();
  }, [items]);

  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items.filter((ticket) => {
      const searchableText = [
        getTicketId(ticket),
        getTitle(ticket),
        getCustomer(ticket),
        getAgent(ticket),
        ticket.description ?? ""
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        getStatus(ticket) === statusFilter;

      const matchesPriority =
        priorityFilter === "all" ||
        getPriority(ticket) === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [items, search, statusFilter, priorityFilter]);

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setPriorityFilter("all");
  };

  const closeDetails = () => setSelectedTicket(null);

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
            MANAGER WORKSPACE
          </Typography>

          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ fontFamily: "Space Grotesk" }}
          >
            Ticket management
          </Typography>

          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Search, filter and inspect support requests.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={
            loading ? (
              <CircularProgress size={16} />
            ) : (
              <RefreshRounded />
            )
          }
          disabled={loading}
          onClick={() => dispatch(fetchTickets())}
          sx={{ borderRadius: 3 }}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2, borderRadius: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => dispatch(fetchTickets())}
            >
              Retry
            </Button>
          }
        >
          {typeof error === "string"
            ? error
            : "Could not load tickets. Please try again."}
        </Alert>
      )}

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3
            }}
          >
            <Typography color="text.secondary" fontSize={12}>
              All tickets
            </Typography>

            <Typography variant="h4" fontWeight={900}>
              {items.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3
            }}
          >
            <Typography color="text.secondary" fontSize={12}>
              Matching results
            </Typography>

            <Typography variant="h4" fontWeight={900}>
              {filteredTickets.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3
            }}
          >
            <Typography color="text.secondary" fontSize={12}>
              High / urgent priority
            </Typography>

            <Typography variant="h4" fontWeight={900}>
              {
                items.filter((ticket) =>
                  ["high", "urgent"].includes(getPriority(ticket))
                ).length
              }
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "19px"
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          mb={2.5}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Search ticket ID, title, customer or agent..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" />
                </InputAdornment>
              )
            }}
          />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All statuses</MenuItem>

              {availableStatuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace(/\b\w/g, (letter) =>
                    letter.toUpperCase()
                  )}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value)}
              displayEmpty
            >
              <MenuItem value="all">All priorities</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="low">Low</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="outlined"
            color="inherit"
            startIcon={<FilterAltOffRounded />}
            onClick={resetFilters}
            sx={{ whiteSpace: "nowrap", borderRadius: 2 }}
          >
            Reset
          </Button>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Typography fontWeight={800}>
            All support tickets
          </Typography>

          <Typography color="text.secondary" variant="caption">
            {filteredTickets.length} result(s)
          </Typography>
        </Stack>

        {loading && items.length === 0 ? (
          <Box py={8} textAlign="center">
            <CircularProgress size={30} />

            <Typography color="text.secondary" mt={2} fontSize={13}>
              Loading tickets...
            </Typography>
          </Box>
        ) : filteredTickets.length === 0 ? (
          <Box py={8} textAlign="center">
            <Avatar
              sx={{
                width: 55,
                height: 55,
                mx: "auto",
                mb: 2,
                bgcolor: "action.hover",
                color: "text.secondary"
              }}
            >
              <ConfirmationNumberOutlined />
            </Avatar>

            <Typography fontWeight={800}>
              No tickets found
            </Typography>

            <Typography color="text.secondary" fontSize={13} mt={0.5}>
              Try changing your search or filters.
            </Typography>

            <Button
              onClick={resetFilters}
              sx={{ mt: 1 }}
            >
              Clear filters
            </Button>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 850 }}>
              <TableHead>
                <TableRow>
                  {[
                    "Ticket",
                    "Customer",
                    "Assigned agent",
                    "Priority",
                    "Status",
                    "Created",
                    "Action"
                  ].map((heading) => (
                    <TableCell
                      key={heading}
                      sx={{
                        color: "text.secondary",
                        fontSize: 11,
                        fontWeight: 900,
                        whiteSpace: "nowrap"
                      }}
                    >
                      {heading.toUpperCase()}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredTickets.map((ticket, index) => (
                  <TableRow
                    key={getTicketId(ticket) ?? index}
                    hover
                    sx={{
                      "&:last-child td": { borderBottom: 0 }
                    }}
                  >
                    <TableCell>
                      <Typography
                        fontSize={11}
                        color="primary.main"
                        fontWeight={800}
                      >
                        #{getTicketId(ticket)}
                      </Typography>

                      <Typography
                        fontSize={13}
                        fontWeight={700}
                        sx={{ maxWidth: 210 }}
                      >
                        {getTitle(ticket)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontSize={12}>
                        {getCustomer(ticket)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography fontSize={12}>
                        {getAgent(ticket)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <PriorityChip priority={getPriority(ticket)} />
                    </TableCell>

                    <TableCell>
                      <TicketStatusChip status={getStatus(ticket)} />
                    </TableCell>

                    <TableCell>
                      <Typography fontSize={12} color="text.secondary">
                        {getDate(ticket)}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        aria-label="View ticket details"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        <VisibilityRounded fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={Boolean(selectedTicket)}
        onClose={closeDetails}
        fullWidth
        maxWidth="sm"
      >
        {selectedTicket && (
          <>
            <DialogTitle>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography fontWeight={900}>
                    Ticket details
                  </Typography>

                  <Typography
                    color="primary.main"
                    variant="caption"
                    fontWeight={800}
                  >
                    #{getTicketId(selectedTicket)}
                  </Typography>
                </Box>

                <IconButton onClick={closeDetails}>
                  <CloseRounded />
                </IconButton>
              </Stack>
            </DialogTitle>

            <DialogContent dividers>
              <Typography variant="h6" fontWeight={800} mb={1}>
                {getTitle(selectedTicket)}
              </Typography>

              <Typography
                color="text.secondary"
                fontSize={13}
                sx={{ whiteSpace: "pre-wrap", mb: 2 }}
              >
                {selectedTicket.description || "No description provided."}
              </Typography>

              <Stack direction="row" gap={1} mb={2} flexWrap="wrap">
                <PriorityChip priority={getPriority(selectedTicket)} />
                <TicketStatusChip status={getStatus(selectedTicket)} />
              </Stack>

              <DetailRow
                label="Customer"
                value={getCustomer(selectedTicket)}
              />

              <DetailRow
                label="Assigned agent"
                value={getAgent(selectedTicket)}
              />

              <DetailRow
                label="Department"
                value={
                  selectedTicket.departmentName ??
                  selectedTicket.department_name ??
                  selectedTicket.department?.name
                }
              />

              <DetailRow
                label="Created date"
                value={getDate(selectedTicket)}
              />

              <DetailRow
                label="Ticket ID"
                value={getTicketId(selectedTicket)}
              />
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
              <Button onClick={closeDetails} variant="outlined">
                Close
              </Button>

              <Button
                variant="contained"
                onClick={() => {
                  navigate(`/manager/tickets/${getTicketId(selectedTicket)}`);
                  closeDetails();
                }}
              >
                Open ticket
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}