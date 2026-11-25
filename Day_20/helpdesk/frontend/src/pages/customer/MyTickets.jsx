import { useCallback, useEffect, useState } from 'react';
import { Box, Chip, Paper, Stack, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import api, { apiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import TicketTable from '../../components/TicketTable';
import TicketDetailDialog from '../../components/TicketDetailDialog';
import StatusFilter from '../../components/StatusFilter';
import { fmtDate } from '../../utils/constants';

export default function CustomerTickets() {
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState('');
  const [tickets, setTickets] = useState([]);
  const [issues, setIssues] = useState([]);
  const [viewId, setViewId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [t, i] = await Promise.all([
        api.get('/tickets', { params: status ? { status } : {} }),
        api.get('/issues'),
      ]);
      setTickets(t.data);
      setIssues(i.data.filter((x) => x.status === 'NEW'));
    } catch (e) { toast(apiError(e), 'error'); }
  }, [status, toast]);

  useEffect(() => { load(); }, [load]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>My tickets</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Tickets" />
        <Tab label={`Waiting for review (${issues.length})`} />
      </Tabs>

      {tab === 0 && (
        <>
          <Stack direction="row" sx={{ mb: 2 }}><StatusFilter value={status} onChange={setStatus} /></Stack>
          <TicketTable rows={tickets} onView={setViewId} showPriority={false} empty="No tickets yet. Raise an issue and a manager will turn it into a ticket." />
        </>
      )}

      {tab === 1 && (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow><TableCell>Subject</TableCell><TableCell>Category</TableCell><TableCell>Submitted</TableCell><TableCell>State</TableCell></TableRow>
            </TableHead>
            <TableBody>
              {issues.map((i) => (
                <TableRow key={i.id}>
                  <TableCell>{i.subject}</TableCell><TableCell>{i.category}</TableCell>
                  <TableCell>{fmtDate(i.created_at)}</TableCell>
                  <TableCell><Chip size="small" color="warning" label="Awaiting manager" /></TableCell>
                </TableRow>
              ))}
              {issues.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>Everything you submitted has become a ticket.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TicketDetailDialog ticketId={viewId} open={!!viewId} onClose={() => setViewId(null)} onChanged={load} />
    </Box>
  );
}
