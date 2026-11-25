import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api, { apiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import StatCard, { statGridSx } from '../../components/StatCard';

export default function AgentDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/stats').then((r) => setStats(r.data)).catch((e) => toast(apiError(e), 'error'));
  }, [toast]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>My work</Typography>
      <Box sx={statGridSx}>
        <StatCard title="My tickets" value={stats?.totalTickets} />
        <StatCard title="Open" value={stats?.openTickets} color="info.main" />
        <StatCard title="In progress" value={stats?.inProgressTickets} color="warning.main" />
        <StatCard title="Closed" value={stats?.closedTickets} color="success.main" />
        <StatCard title="Available to pick" value={stats?.availableTickets} color="secondary.main" />
      </Box>
      <Button component={RouterLink} to="/agent/tickets" variant="contained" sx={{ mt: 3 }}>
        {stats?.availableTickets ? 'Pick up a ticket' : 'Go to my tickets'}
      </Button>
    </Box>
  );
}
