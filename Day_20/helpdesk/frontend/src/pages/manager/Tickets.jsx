import { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Paper, Stack, Tab, Tabs,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import api, { apiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import TicketTable from '../../components/TicketTable';
import TicketDetailDialog from '../../components/TicketDetailDialog';
import StatusFilter from '../../components/StatusFilter';
import { fmtDate } from '../../utils/constants';

export default function ManagerTickets() {
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState('');
  const [tickets, setTickets] = useState([]);
  const [issues, setIssues] = useState([]);
  const [agents, setAgents] = useState([]);
  const [viewId, setViewId] = useState(null);
  const [issue, setIssue] = useState(null); // issue being converted
  const [agentId, setAgentId] = useState('');

  const loadTickets = useCallback(async () => {
    try {
      const { data } = await api.get('/tickets', { params: status ? { status } : {} });
      setTickets(data);
    } catch (e) { toast(apiError(e), 'error'); }
  }, [status, toast]);

  const loadIssues = useCallback(async () => {
    try {
      const { data } = await api.get('/issues');
      setIssues(data);
    } catch (e) { toast(apiError(e), 'error'); }
  }, [toast]);

  useEffect(() => { loadTickets(); }, [loadTickets]);
  useEffect(() => {
    loadIssues();
    api.get('/agents').then((r) => setAgents(r.data.filter((a) => a.status === 'ACTIVE'))).catch(() => {});
  }, [loadIssues]);

  const createTicket = async () => {
    try {
      const { data } = await api.post(`/issues/${issue.id}/create-ticket`, { agentId: agentId || null });
      toast(`Ticket #${data.ticketId} created`);
      setIssue(null);
      setAgentId('');
      loadIssues();
      loadTickets();
    } catch (e) { toast(apiError(e), 'error'); }
  };

  const newIssues = issues.filter((i) => i.status === 'NEW').length;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Tickets</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="All tickets" />
        <Tab label={`Customer issues${newIssues ? ` (${newIssues} new)` : ''}`} />
      </Tabs>

      {tab === 0 && (
        <>
          <Stack direction="row" sx={{ mb: 2 }}><StatusFilter value={status} onChange={setStatus} /></Stack>
          <TicketTable rows={tickets} showCustomer onView={setViewId} />
        </>
      )}

      {tab === 1 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Customer</TableCell><TableCell>Subject</TableCell><TableCell>Category</TableCell>
                <TableCell>Submitted</TableCell><TableCell>State</TableCell><TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {issues.map((i) => (
                <TableRow key={i.id} hover>
                  <TableCell>{i.name}<Typography variant="caption" display="block" color="text.secondary">{i.email} - {i.mobile}</Typography></TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>{i.subject}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">{i.description}</Typography>
                  </TableCell>
                  <TableCell>{i.category}</TableCell>
                  <TableCell>{fmtDate(i.created_at)}</TableCell>
                  <TableCell>
                    {i.status === 'NEW' ? <Chip size="small" color="warning" label="Needs review" /> : <Chip size="small" label={`Ticket #${i.ticket_id}`} />}
                  </TableCell>
                  <TableCell align="right">
                    {i.status === 'NEW' && <Button size="small" variant="contained" onClick={() => setIssue(i)}>Create ticket</Button>}
                  </TableCell>
                </TableRow>
              ))}
              {issues.length === 0 && (
                <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No customer issues yet.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={!!issue} onClose={() => setIssue(null)} fullWidth maxWidth="sm">
        <DialogTitle>Create ticket from issue</DialogTitle>
        <DialogContent>
          <Typography fontWeight={600}>{issue?.subject}</Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 2, whiteSpace: 'pre-wrap' }}>{issue?.description}</Typography>
          <TextField select fullWidth size="small" label="Assign to an agent (optional)" value={agentId} onChange={(e) => setAgentId(e.target.value)}
            helperText="Leave empty to let agents pick it up themselves.">
            <MenuItem value="">Leave unassigned</MenuItem>
            {agents.map((a) => <MenuItem key={a.id} value={a.id}>{a.name} ({a.active_workload} active)</MenuItem>)}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIssue(null)}>Cancel</Button>
          <Button variant="contained" onClick={createTicket}>Create ticket</Button>
        </DialogActions>
      </Dialog>

      <TicketDetailDialog ticketId={viewId} open={!!viewId} onClose={() => setViewId(null)} onChanged={loadTickets} />
    </Box>
  );
}
