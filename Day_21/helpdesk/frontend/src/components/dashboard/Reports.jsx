
'use client';

import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography
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
  STATUS_LABELS
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

export default function Reports({
  counts = [],
  trend = [],
  totalTickets = 0
}) {
  const statusData = Object.keys(STATUS_LABELS).map((status) => {
    const matchingItem = counts.find(
      (item) => item.status === status
    );

    return {
      status,
      name: STATUS_LABELS[status],
      total: Number(matchingItem?.total || 0)
    };
  });

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={900}>
          Reports & Analytics 📊
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Understand ticket volume and resolution activity.
        </Typography>
      </Box>

      {/* SUMMARY */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography color="text.secondary" fontWeight={700}>
                Total tickets
              </Typography>

              <Typography variant="h4" fontWeight={900} mt={1}>
                {totalTickets}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Card sx={{ borderRadius: 4 }}>
            <CardContent>
              <Typography color="text.secondary" fontWeight={700}>
                Resolved tickets
              </Typography>

              <Typography variant="h4" fontWeight={900} mt={1}>
                {statusData.find(
                  (item) => item.status === 'RESOLVED'
                )?.total || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* TREND CHART */}
      <Card sx={{ borderRadius: 4, mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography fontWeight={850} mb={2}>
            Ticket creation trend
          </Typography>

          <Box height={320}>
            {trend.length === 0 ? (
              <Stack
                height="100%"
                alignItems="center"
                justifyContent="center"
              >
                <Typography color="text.secondary">
                  No trend data available.
                </Typography>
              </Stack>
            ) : (
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
                    name="Tickets"
                    fill="#7158f5"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* STATUS DISTRIBUTION */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={850} mb={2}>
                Status distribution
              </Typography>

              <Box height={260}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData.filter((item) => item.total > 0)}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                    >
                      {statusData
                        .filter((item) => item.total > 0)
                        .map((item) => (
                          <Cell
                            key={item.status}
                            fill={
                              CHART_COLORS[
                                Object.keys(STATUS_LABELS).indexOf(item.status)
                                % CHART_COLORS.length
                              ]
                            }
                          />
                        ))}
                    </Pie>

                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, height: '100%' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography fontWeight={850} mb={2}>
                Ticket status summary
              </Typography>

              <Stack spacing={1.5}>
                {statusData.map((item, index) => (
                  <Stack
                    key={item.status}
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: '50%',
                          backgroundColor: CHART_COLORS[index]
                        }}
                      />

                      <Typography variant="body2" fontWeight={600}>
                        {item.name}
                      </Typography>
                    </Stack>

                    <Chip
                      size="small"
                      label={item.total}
                      variant="outlined"
                    />
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
