
'use client';

import {
  Box,
  Paper,
  Card,
  CardContent,
  Grid,
  Typography,
  Chip,
  Button,
  Pagination,
  Stack,
  Divider
} from '@mui/material';

import {
  ConfirmationNumberRounded,
  CalendarMonthRounded,
  PersonRounded,
  VisibilityRounded,
  CircleRounded
} from '@mui/icons-material';

import {
  STATUS_LABELS,
  STATUS_COLORS
} from '../../constants/dashboard';

export default function TicketCards({
  tickets = [],
  totalCount = 0,
  page = 1,
  totalPages = 1,
  setPage,
  onOpenTicket,
  showCustomerPresence = false
}) {
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
          sx={{
            borderRadius: 4,
            backgroundColor: 'background.paper'
          }}
        >
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
        </Paper>
      ) : (
        <Grid container spacing={2.5}>
          {tickets.map(ticket => {
            const presence = getCustomerPresence(ticket);

            return (
              <Grid
                item
                xs={12}
                sm={6}
                lg={4}
                key={ticket.id}
              >
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: '0.25s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 14px 30px rgba(30,20,80,0.10)',
                      borderColor: 'primary.main'
                    }
                  }}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      spacing={1}
                      mb={2}
                    >
                      <Box minWidth={0}>
                        <Typography
                          variant="caption"
                          color="primary"
                          fontWeight={900}
                        >
                          {getTicketNumber(ticket)}
                        </Typography>

                        <Typography
                          variant="h6"
                          fontWeight={850}
                          sx={{
                            mt: 0.5,
                            overflowWrap: 'anywhere'
                          }}
                        >
                          {getTicketTitle(ticket)}
                        </Typography>
                      </Box>

                      <ConfirmationNumberRounded
                        color="primary"
                        sx={{ fontSize: 27, flexShrink: 0 }}
                      />
                    </Stack>

                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1}
                      mb={2}
                    >
                      <Chip
                        size="small"
                        label={getStatus(ticket.status)}
                        color={getStatusColor(ticket.status)}
                      />

                      <Chip
                        size="small"
                        label={ticket.priority || 'MEDIUM'}
                        color={getPriorityColor(ticket.priority)}
                        variant="outlined"
                      />
                    </Stack>

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={1.5}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                      >
                        <PersonRounded
                          fontSize="small"
                          color="action"
                        />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {ticket.customer_name ||
                            ticket.customer ||
                            'Customer unavailable'}
                        </Typography>
                      </Stack>

                      {/* CUSTOMER ONLINE / OFFLINE STATUS */}

                      {showCustomerPresence && (
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1}
                          sx={{ pl: 0.2 }}
                        >
                          {presence === 'ONLINE' && (
                            <>
                              <CircleRounded
                                sx={{
                                  fontSize: 10,
                                  color: 'success.main'
                                }}
                              />

                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color="success.main"
                              >
                                Customer Online
                              </Typography>
                            </>
                          )}

                          {presence === 'OFFLINE' && (
                            <>
                              <CircleRounded
                                sx={{
                                  fontSize: 10,
                                  color: 'text.disabled'
                                }}
                              />

                              <Typography
                                variant="body2"
                                fontWeight={700}
                                color="text.secondary"
                              >
                                Customer Offline
                              </Typography>
                            </>
                          )}

                          {presence === 'UNKNOWN' && (
                            <Typography
                              variant="caption"
                              color="text.disabled"
                            >
                              Customer presence unavailable
                            </Typography>
                          )}
                        </Stack>
                      )}

                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                      >
                        <CalendarMonthRounded
                          fontSize="small"
                          color="action"
                        />

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {getDate(ticket.created_at)}
                        </Typography>
                      </Stack>

                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        Agent: {ticket.agent_name || 'Unassigned'}
                      </Typography>
                    </Stack>

                    <Box mt={2.5}>
                      <Button
                        fullWidth
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
                        View Ticket
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
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
