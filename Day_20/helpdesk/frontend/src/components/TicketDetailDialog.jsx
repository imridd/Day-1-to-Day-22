import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, IconButton,
  List, ListItem, ListItemText, MenuItem, Stack, TextField, Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import api, { apiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import StatusChip from './StatusChip';
import PriorityChip from './PriorityChip';
import { STATUSES, fmtDate } from '../utils/constants';
import { noteSchema, validate } from '../validation/schemas';

const Section = ({ title, children }) => (
  <Box sx={{ mt: 3 }}>
    <Typography variant="subtitle1" fontWeight={600} gutterBottom>{title}</Typography>
    {children}
  </Box>
);

export default function TicketDetailDialog({ ticketId, open, onClose, onChanged }) {
  const { user } = useAuth();
  const toast = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [agents, setAgents] = useState([]);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState('');
  const fileRef = useRef(null);

  const isManager = user.role === 'MANAGER';
  const isAgent = user.role === 'AGENT';

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}`);
      setData(res.data);
      setError('');
    } catch (e) {
      setError(apiError(e));
    }
  }, [ticketId]);

  useEffect(() => {
    if (!open || !ticketId) return;
    setData(null);
    setNote('');
    setNoteError('');
    load();
    if (isManager) {
      api.get('/agents').then((r) => setAgents(r.data.filter((a) => a.status === 'ACTIVE'))).catch(() => {});
    }
  }, [open, ticketId, isManager, load]);

  const run = async (fn, okMessage) => {
    try {
      await fn();
      if (okMessage) toast(okMessage);
      await load();
      onChanged?.();
    } catch (e) {
      toast(apiError(e), 'error');
    }
  };

  const changeStatus = (status) => run(() => api.patch(`/tickets/${ticketId}/status`, { status }), 'Status updated');
  const changePriority = (priority) => run(() => api.patch(`/tickets/${ticketId}/priority`, { priority }), 'Priority updated');
  const assign = (agentId) => run(() => api.patch(`/tickets/${ticketId}/assign`, { agentId: agentId || null }), 'Assignment updated');

  const addNote = async () => {
    const v = validate(noteSchema, { note });
    if (!v.ok) return setNoteError(v.errors.note);
    setNoteError('');
    await run(() => api.post(`/tickets/${ticketId}/notes`, { note: v.data.note }), 'Note added');
    setNote('');
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast('File is larger than 5 MB', 'error');
    const form = new FormData();
    form.append('file', file);
    await run(() => api.post(`/tickets/${ticketId}/attachments`, form), 'File uploaded');
  };

  const download = async (att) => {
    try {
      const res = await api.get(`/attachments/${att.id}`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = att.original_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast(apiError(e), 'error');
    }
  };

  const t = data?.ticket;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ flexGrow: 1 }}>Ticket #{ticketId}</Box>
        <IconButton onClick={onClose} aria-label="Close"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error">{error}</Alert>}
        {!data && !error && <Box sx={{ textAlign: 'center', py: 6 }}><CircularProgress /></Box>}

        {t && (
          <>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>{t.subject}</Typography>
              <StatusChip status={t.status} />
              {user.role !== 'CUSTOMER' && <PriorityChip priority={t.priority} />}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {t.category} - {t.customer_name} ({t.customer_email}) - opened {fmtDate(t.created_at)}
            </Typography>
            <Typography sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>{t.description}</Typography>

            <Section title="Assignment, priority and status">
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {isManager ? (
                  <TextField select size="small" label="Assigned agent" sx={{ minWidth: 220 }}
                    value={t.assigned_agent_id || ''} onChange={(e) => assign(e.target.value)}>
                    <MenuItem value="">Unassigned</MenuItem>
                    {agents.map((a) => <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>)}
                  </TextField>
                ) : (
                  <Typography variant="body2">Agent: {t.agent_name || 'Not assigned yet'}</Typography>
                )}
                {isManager ? (
                  <TextField select size="small" label="Priority" sx={{ minWidth: 160 }}
                    value={t.priority || 'MEDIUM'} onChange={(e) => changePriority(e.target.value)}>
                    <MenuItem value="HIGH">High</MenuItem>
                    <MenuItem value="MEDIUM">Medium</MenuItem>
                    <MenuItem value="LOW">Low</MenuItem>
                  </TextField>
                ) : isAgent ? (
                  <Stack justifyContent="center" spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">Priority set by manager</Typography>
                    <PriorityChip priority={t.priority} />
                  </Stack>
                ) : null}
                {(isManager || isAgent) && (
                  <TextField select size="small" label="Status" sx={{ minWidth: 180 }}
                    value={t.status} onChange={(e) => changeStatus(e.target.value)}>
                    {STATUSES.map((s) => <MenuItem key={s} value={s}>{s.replace('_', ' ')}</MenuItem>)}
                  </TextField>
                )}
              </Stack>
            </Section>

            {user.role !== 'CUSTOMER' && (
              <>
                <Section title="Agent notes">
                  {isAgent && (
                    <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 1 }}>
                      <TextField fullWidth size="small" multiline minRows={2} placeholder="Write an internal note"
                        value={note} onChange={(e) => setNote(e.target.value)} error={!!noteError} helperText={noteError} />
                      <Button variant="contained" onClick={addNote}>Add note</Button>
                    </Stack>
                  )}
                  {data.notes.length === 0 && <Typography variant="body2" color="text.secondary">No notes yet.</Typography>}
                  <List dense disablePadding>
                    {data.notes.map((n) => (
                      <ListItem key={n.id} disableGutters divider>
                        <ListItemText primary={n.note} secondary={`${n.agent_name} - ${fmtDate(n.created_at)}`}
                          primaryTypographyProps={{ sx: { whiteSpace: 'pre-wrap' } }} />
                      </ListItem>
                    ))}
                  </List>
                </Section>

                <Section title="Attachments">
                  {isAgent && (
                    <>
                      <input ref={fileRef} type="file" hidden onChange={upload} />
                      <Button startIcon={<AttachFileIcon />} onClick={() => fileRef.current?.click()} sx={{ mb: 1 }}>
                        Upload file (max 5 MB)
                      </Button>
                    </>
                  )}
                  {data.attachments.length === 0 && <Typography variant="body2" color="text.secondary">No attachments.</Typography>}
                  <List dense disablePadding>
                    {data.attachments.map((a) => (
                      <ListItem key={a.id} disableGutters divider
                        secondaryAction={<IconButton onClick={() => download(a)} aria-label="Download"><DownloadIcon /></IconButton>}>
                        <ListItemText primary={a.original_name}
                          secondary={`${(a.size / 1024).toFixed(1)} KB - ${a.uploaded_by_name} - ${fmtDate(a.created_at)}`} />
                      </ListItem>
                    ))}
                  </List>
                </Section>
              </>
            )}

            <Divider sx={{ mt: 3 }} />
            <Section title="History">
              <List dense disablePadding>
                {data.history.map((h) => (
                  <ListItem key={h.id} disableGutters>
                    <ListItemText
                      primary={`${h.action.replace(/_/g, ' ').toLowerCase()}${h.details ? ': ' + h.details : ''}`}
                      secondary={`${h.actor_name || 'System'} - ${fmtDate(h.created_at)}`}
                      primaryTypographyProps={{ sx: { textTransform: 'capitalize' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Section>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
