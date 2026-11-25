
'use client';

import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Button,
  Pagination,
  Stack
} from '@mui/material';

import {
  ConfirmationNumberRounded,
  VisibilityRounded,
  CircleRounded
} from '@mui/icons-material';

import {
  STATUS_LABELS,
  STATUS_COLORS
} from '../../constants/dashboard';

export default function TicketTable({
  tickets = [],
  totalCount = 0,
  page = 1,
  totalPages = 1,
  setPage,
  onOpenTicket,
  onSort,
  sortBy,
  sortOrder = 'asc',
  showCustomerPresence = false
}) {
  const isAscending =
    sortOrder === 'asc' || sortOrder === 1;

  const getPriorityColor = priority => {
    const value = String(priority || 'MEDIUM').toUpperCase();

    if (value === 'HIGH' || value === 'URGENT') return 'error';
    if (value === 'MEDIUM') return 'warning';

    return 'success';
  };

  const getStatus = status =>
    STATUS_LABELS[status] || status || 'Open';

  const getStatusColor = status =>
    STATUS_COLORS[status] || 'default';

  const getTicketNumber = ticket =>
    ticket.ticket_no ||
    ticket.ticket_number ||
    ticket.id;

  const getTicketTitle = ticket =>
    ticket.title ||
    ticket.issue ||
    'Untitled ticket';

  const getDate = date => {
    if (!date) return '-';

    const parsed = new Date(date);

    return Number.isNaN(parsed.getTime())
      ? '-'
      : parsed.toLocaleDateString();
  };

  // CUSTOMER PRESENCE

  const getCustomerPresence = ticket => {
    const value = ticket.customer_online;

    if (
      value === true ||
      value === 1 ||
      value === '1' ||
      value === 'true'
    ) {
      return 'ONLINE';
    }

    if (
      value === false ||
      value === 0 ||
      value === '0' ||
      value === 'false'
    ) {
      return 'OFFLINE';
    }

    return 'UNKNOWN';
  };

  const SortHeader = ({ label, field }) => (
    <TableCell
      onClick={() => onSort?.(field)}
      sx={{
        fontWeight: 800,
        cursor: onSort ? 'pointer' : 'default',
        whiteSpace: 'nowrap',
        userSelect: 'none',
        '&:hover': {
          color: onSort ? 'primary.main' : 'inherit'
        }
      }}
    >
      {label}
      {sortBy === field
        ? isAscending ? ' ↑' : ' ↓'
        : ''}
    </TableCell>
  );

  const EmptyState = () => (
    <Box py={7} textAlign="center">
      <ConfirmationNumberRounded
        sx={{
          fontSize: 48,
          color: 'text.disabled',
          mb: 1
        }}
      />

      <Typography fontWeight={800}>
        No tickets found
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Your tickets will appear here.
      </Typography>
    </Box>
  );

  const startItem = totalCount === 0
    ? 0
    : (page - 1) * 8 + 1;

  const endItem = Math.min(page * 8, totalCount);

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={900}>
          All tickets
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Manage and track your support requests.
        </Typography>
      </Box>

      {tickets.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ borderRadius: 4 }}
        >
          <EmptyState />
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            overflowX: 'auto'
          }}
        >
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'action.hover' }}>
                <SortHeader label="Ticket" field="id" />
                <SortHeader label="Issue" field="title" />
                <SortHeader label="Priority" field="priority" />
                <SortHeader label="Status" field="status" />
                <SortHeader label="Created" field="created_at" />

                <TableCell
                  align="right"
                  sx={{ fontWeight: 800 }}
                >
                  Action
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {tickets.map(ticket => {
                const presence = getCustomerPresence(ticket);

                return (
                  <TableRow
                    key={ticket.id}
                    hover
                    sx={{
                      '&:last-child td': {
                        borderBottom: 0
                      }
                    }}
                  >
                    <TableCell>
                      <Typography fontWeight={800} color="primary">
                        {getTicketNumber(ticket)}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ minWidth: 170 }}>
                      <Typography fontWeight={700}>
                        {getTicketTitle(ticket)}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {ticket.customer_name || ticket.customer || '-'}
                      </Typography>

                      {showCustomerPresence && (
                        <Box mt={0.7}>
                          {presence === 'ONLINE' && (
                            <Chip
                              size="small"
                              icon={
                                <CircleRounded
                                  sx={{ fontSize: '9px !important' }}
                                />
                              }
                              label="Online"
                              color="success"
                              variant="outlined"
                              sx={{
                                height: 23,
                                fontWeight: 700,
                                '& .MuiChip-icon': {
                                  color: 'success.main'
                                }
                              }}
                            />
                          )}

                          {presence === 'OFFLINE' && (
                            <Chip
                              size="small"
                              icon={
                                <CircleRounded
                                  sx={{ fontSize: '9px !important' }}
                                />
                              }
                              label="Offline"
                              color="default"
                              variant="outlined"
                              sx={{
                                height: 23,
                                fontWeight: 700,
                                '& .MuiChip-icon': {
                                  color: 'text.disabled'
                                }
                              }}
                            />
                          )}

                          {presence === 'UNKNOWN' && (
                            <Typography
                              variant="caption"
                              color="text.disabled"
                            >
                              Presence unavailable
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={ticket.priority || 'MEDIUM'}
                        color={getPriorityColor(ticket.priority)}
                      />
                    </TableCell>

                    <TableCell>
                      <Chip
                        size="small"
                        label={getStatus(ticket.status)}
                        color={getStatusColor(ticket.status)}
                      />
                    </TableCell>

                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {getDate(ticket.created_at)}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<VisibilityRounded />}
                        onClick={() => onOpenTicket?.(ticket)}
                        sx={{
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 800
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {totalCount > 0 && (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
          mt={3}
          px={1}
        >
          <Typography variant="body2" color="text.secondary">
            Showing {startItem}–{endItem} of {totalCount} tickets
          </Typography>

          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage?.(value)}
            color="primary"
            shape="rounded"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        </Stack>
      )}
    </Box>
  );
}
