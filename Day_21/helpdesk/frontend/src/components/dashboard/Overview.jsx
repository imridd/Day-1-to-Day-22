
'use client';

import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip
} from '@mui/material';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import {
  ConfirmationNumberRounded,
  FiberNewRounded,
  AutorenewRounded,
  CheckCircleRounded
} from '@mui/icons-material';

import Stat from './Stat';

import {
  STATUS_LABELS,
  STATUS_COLORS
} from '../../constants/dashboard';

const CHART_COLORS = [
  '#7158f5',
  '#ff6b9d',
  '#16a36a',
  '#ed9b25',
  '#2196f3',
  '#9c27b0',
  '#607d8b',
  '#795548'
];

export default function Overview({
  counts = [],
  trend = [],
  tickets = [],
  totalTickets = 0
}) {
  const statusCounts = Object.keys(STATUS_LABELS).map(status => {
    const item = counts.find(
      entry => entry.status === status
    );

    return {
      status,
      name: STATUS_LABELS[status],
      total: Number(item?.total || 0)
    };
  });

  const statCards = [
    {
      label: 'Total Tickets',
      value: totalTickets,
      color: 'primary',
      subtitle: 'Tickets in your workspace',
      icon: <ConfirmationNumberRounded />
    },

    ...statusCounts.map(item => ({
      label: item.name,
      value: item.total,
      color: STATUS_COLORS[item.status] || 'primary',
      subtitle: `${item.name} tickets`,
      icon:
        item.status === 'OPEN'
          ? <FiberNewRounded />
          : item.status === 'IN_PROGRESS'
            ? <AutorenewRounded />
            : item.status === 'RESOLVED'
              ? <CheckCircleRounded />
              : <ConfirmationNumberRounded />
    }))
  ];

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={900}>
          Your overview ✨
        </Typography>

        <Typography color="text.secondary" variant="body2">
          Here's what's happening in your workspace.
        </Typography>
      </Box>

      {/* STATISTICS - 3 CARDS PER ROW */}
      <Grid container spacing={2.5} mb={3}>
        {statCards.map(card => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={card.label}
          >
            <Stat {...card} />
          </Grid>
        ))}
      </Grid>

      {/* CHARTS */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={7}>
          <Card sx={{ height: '100%', borderRadius: 4 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography fontWeight={850} mb={2}>
                Ticket activity
              </Typography>

              <Box height={280}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trend}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis dataKey="date" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar
                      dataKey="total"
                      fill="#7158f5"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card sx={{ height: '100%', borderRadius: 4 }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography fontWeight={850} mb={2}>
                Ticket distribution
              </Typography>

              <Box height={240}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusCounts.filter(
                        item => item.total > 0
                      )}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={85}
                      innerRadius={55}
                      paddingAngle={3}
                    >
                      {statusCounts
                        .filter(item => item.total > 0)
                        .map(item => (
                          <Cell
                            key={item.status}
                            fill={
                              CHART_COLORS[
                                Object.keys(STATUS_LABELS).indexOf(
                                  item.status
                                ) % CHART_COLORS.length
                              ]
                            }
                          />
                        ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>

              <Stack
                direction="row"
                flexWrap="wrap"
                gap={1}
                justifyContent="center"
              >
                {statusCounts
                  .filter(item => item.total > 0)
                  .map(item => (
                    <Chip
                      key={item.status}
                      size="small"
                      label={`${item.name}: ${item.total}`}
                      variant="outlined"
                    />
                  ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
