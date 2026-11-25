import { useCallback, useEffect, useState } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import api, { apiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import StatCard, { statGridSx } from '../../components/StatCard';
import TicketTable from '../../components/TicketTable';
import TicketDetailDialog from '../../components/TicketDetailDialog';

export default function ManagerDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [agents, setAgents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [viewId, setViewId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [s, a, t] = await Promise.all([api.get('/stats'), api.get('/agents'), api.get('/tickets')]);
      setStats(s.data);
      setAgents(a.data);
      setTickets(t.data.slice(0, 6));
    } catch (e) {
      toast(apiError(e), 'error');
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Overview</Typography>
      <Box sx={statGridSx}>
        <StatCard title="Total tickets" value={stats?.totalTickets} />
        <StatCard title="Open" value={stats?.openTickets} color="info.main" />
        <StatCard title="In progress" value={stats?.inProgressTickets} color="warning.main" />
        <StatCard title="Closed" value={stats?.closedTickets} color="success.main" />
        <StatCard title="Total agents" value={stats?.totalAgents} color="secondary.main" />
      </Box>
      {stats && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          {stats.resolvedTickets} resolved, {stats.unassignedTickets} waiting for an agent.
        </Typography>
      )}

      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Latest tickets</Typography>
      <TicketTable rows={tickets} showCustomer onView={setViewId} />

      <Typography variant="h6" sx={{ mt: 4, mb: 1 }}>Agent workload</Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Agent</TableCell>
              <TableCell align="right">Open</TableCell>
              <TableCell align="right">In progress</TableCell>
              <TableCell align="right">Resolved</TableCell>
              <TableCell align="right">Closed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.name}{a.status === 'DISABLED' ? ' (disabled)' : ''}</TableCell>
                <TableCell align="right">{a.open_tickets}</TableCell>
                <TableCell align="right">{a.in_progress}</TableCell>
                <TableCell align="right">{a.resolved}</TableCell>
                <TableCell align="right">{a.closed}</TableCell>
              </TableRow>
            ))}
            {agents.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 3, color: 'text.secondary' }}>No agents yet. Add one from the Agents page.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TicketDetailDialog ticketId={viewId} open={!!viewId} onClose={() => setViewId(null)} onChanged={load} />
    </Box>
  );
}
