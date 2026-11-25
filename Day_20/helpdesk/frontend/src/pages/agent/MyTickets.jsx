import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Chip, Stack, Tab, Tabs, Typography } from '@mui/material';
import api, { apiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import TicketTable from '../../components/TicketTable';
import TicketDetailDialog from '../../components/TicketDetailDialog';
import StatusFilter from '../../components/StatusFilter';

export default function AgentTickets() {
  const toast = useToast();
  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState('');
  const [mine, setMine] = useState([]);
  const [pool, setPool] = useState([]);
  const [viewId, setViewId] = useState(null);

  const load = useCallback(async () => {
    try {
      const [m, p] = await Promise.all([
        api.get('/tickets', { params: { scope: 'mine', ...(status ? { status } : {}) } }),
        api.get('/tickets', { params: { scope: 'pool' } }),
      ]);
      setMine(m.data);
      setPool(p.data);
    } catch (e) { toast(apiError(e), 'error'); }
  }, [status, toast]);

  useEffect(() => { load(); }, [load]);

  const pick = async (id) => {
    try {
      await api.post(`/tickets/${id}/pick`);
      toast(`Ticket #${id} is yours`);
      setTab(0);
    } catch (e) {
      toast(apiError(e), 'error'); // e.g. "Assigned to Agent1"
    }
    load();
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>Tickets</Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label={`Assigned to me (${mine.length})`} />
        <Tab label={`Pick up (${pool.filter((t) => !t.locked).length} free)`} />
      </Tabs>

      {tab === 0 && (
        <>
          <Stack direction="row" sx={{ mb: 2 }}><StatusFilter value={status} onChange={setStatus} /></Stack>
          <TicketTable rows={mine} showCustomer showAgent={false} onView={setViewId}
            empty="Nothing assigned to you yet. Pick one from the Pick up tab." />
        </>
      )}

      {tab === 1 && (
        <TicketTable rows={pool} showAgent={false} empty="No tickets waiting right now."
          renderAction={(t) =>
            t.locked
              ? <Chip size="small" variant="outlined" label={`Assigned to ${t.agent_name}`} />
              : <Button size="small" variant="contained" onClick={() => pick(t.ticket_id)}>Pick up</Button>} />
      )}

      <TicketDetailDialog ticketId={viewId} open={!!viewId} onClose={() => setViewId(null)} onChanged={load} />
    </Box>
  );
}
