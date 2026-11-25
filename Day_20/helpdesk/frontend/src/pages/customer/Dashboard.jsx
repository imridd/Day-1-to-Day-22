import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import api, { apiError } from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StatCard, { statGridSx } from '../../components/StatCard';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/stats').then((r) => setStats(r.data)).catch((e) => toast(apiError(e), 'error'));
  }, [toast]);

  return (
    <Box>
      <Typography variant="h5">Hello, {user.name.split(' ')[0]}</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>Here is where your requests stand.</Typography>
      <Box sx={statGridSx}>
        <StatCard title="Total tickets" value={stats?.totalTickets} />
        <StatCard title="Open" value={stats?.openTickets} color="info.main" />
        <StatCard title="In progress" value={stats?.inProgressTickets} color="warning.main" />
        <StatCard title="Resolved" value={stats?.resolvedTickets} color="success.main" />
        <StatCard title="Closed" value={stats?.closedTickets} color="text.disabled" />
      </Box>
      <Button component={RouterLink} to="/customer/raise-issue" variant="contained" sx={{ mt: 3 }}>Raise an issue</Button>
    </Box>
  );
}
