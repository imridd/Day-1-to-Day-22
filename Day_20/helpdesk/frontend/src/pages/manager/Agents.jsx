import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack, Switch, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import api, { apiError } from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { agentCreateSchema, agentEditSchema, validate } from '../../validation/schemas';
import { fmtDate } from '../../utils/constants';

const EMPTY = { name: '', email: '', password: '' };

export default function ManagerAgents() {
  const toast = useToast();
  const [agents, setAgents] = useState([]);
  const [dialog, setDialog] = useState(null); // null | { mode: 'create' | 'edit', id? }
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const load = useCallback(async () => {
    try { setAgents((await api.get('/agents')).data); } catch (e) { toast(apiError(e), 'error'); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setValues(EMPTY); setErrors({}); setServerError(''); setDialog({ mode: 'create' }); };
  const openEdit = (a) => { setValues({ name: a.name, email: a.email, password: '' }); setErrors({}); setServerError(''); setDialog({ mode: 'edit', id: a.id }); };
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const save = async () => {
    const creating = dialog.mode === 'create';
    const v = validate(creating ? agentCreateSchema : agentEditSchema, values);
    setErrors(v.errors);
    if (!v.ok) return;
    try {
      if (creating) await api.post('/agents', v.data);
      else await api.put(`/agents/${dialog.id}`, v.data);
      toast(creating ? 'Agent added' : 'Agent updated');
      setDialog(null);
      load();
    } catch (e) { setServerError(apiError(e)); }
  };

  const toggle = async (a) => {
    try {
      await api.patch(`/agents/${a.id}/status`, { status: a.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' });
      toast(a.status === 'ACTIVE' ? 'Agent disabled' : 'Agent enabled');
      load();
    } catch (e) { toast(apiError(e), 'error'); }
  };

  const editing = dialog?.mode === 'edit';

  return (
    <Box>
      <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ flexGrow: 1 }}>Agents</Typography>
        <Button variant="contained" onClick={openCreate}>Add agent</Button>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell><TableCell>Email</TableCell>
              <TableCell align="right">Open</TableCell><TableCell align="right">In progress</TableCell>
              <TableCell align="right">Resolved</TableCell><TableCell align="right">Closed</TableCell>
              <TableCell>Added</TableCell><TableCell align="center">Active</TableCell><TableCell align="right">Edit</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((a) => (
              <TableRow key={a.id} hover sx={{ opacity: a.status === 'DISABLED' ? 0.55 : 1 }}>
                <TableCell>{a.name}</TableCell>
                <TableCell>{a.email}</TableCell>
                <TableCell align="right">{a.open_tickets}</TableCell>
                <TableCell align="right">{a.in_progress}</TableCell>
                <TableCell align="right">{a.resolved}</TableCell>
                <TableCell align="right">{a.closed}</TableCell>
                <TableCell>{fmtDate(a.created_at)}</TableCell>
                <TableCell align="center">
                  <Switch checked={a.status === 'ACTIVE'} onChange={() => toggle(a)} inputProps={{ 'aria-label': `Toggle ${a.name}` }} />
                </TableCell>
                <TableCell align="right"><Button size="small" onClick={() => openEdit(a)}>Edit</Button></TableCell>
              </TableRow>
            ))}
            {agents.length === 0 && (
              <TableRow><TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>No agents yet. Add the first one.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!dialog} onClose={() => setDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>{editing ? 'Edit agent' : 'Add agent'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {serverError && <Alert severity="error">{serverError}</Alert>}
            <TextField label="Full name" value={values.name} onChange={set('name')} error={!!errors.name} helperText={errors.name} autoFocus />
            <TextField label="Email" type="email" value={values.email} onChange={set('email')} error={!!errors.email} helperText={errors.email} />
            <TextField label={editing ? 'New password (leave blank to keep)' : 'Password'} type="password" value={values.password}
              onChange={set('password')} error={!!errors.password} helperText={errors.password || 'At least 8 characters with a letter and a number'} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialog(null)}>Cancel</Button>
          <Button variant="contained" onClick={save}>{editing ? 'Save changes' : 'Add agent'}</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
