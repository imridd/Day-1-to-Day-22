import { useCallback, useEffect, useRef, useState } from 'react';
import { Avatar, Box, Chip, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import DoneRoundedIcon from '@mui/icons-material/DoneRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import api, { apiError } from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { chatSchema } from '../validation/schemas';

export default function ChatWindow({ thread, onRead }) {
  const { user } = useAuth();
  const toast = useToast();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const latestId = useRef(0);
  const { ticketId, room } = thread;
  const isClosed = thread.status === 'CLOSED';
  const key = `${ticketId}:${room}`;

  const markRead = useCallback(async () => {
    try {
      await api.patch(`/chat/${ticketId}/${room}/read`);
      onRead?.();
    } catch { /* Polling will retry on the next refresh. */ }
  }, [ticketId, room, onRead]);

  const loadMessages = useCallback(async (initial = false) => {
    try {
      const { data } = await api.get(`/chat/${ticketId}/${room}/messages`);
      setMessages((prev) => {
        const unchanged = prev.length === data.length && prev.every((message, index) =>
          message.id === data[index]?.id && Number(message.read_status) === Number(data[index]?.read_status)
        );
        return unchanged ? prev : data;
      });
      if (data.length) latestId.current = Math.max(...data.map((message) => Number(message.id)));
      if (initial || data.some((message) => Number(message.sender_id) !== Number(user.id) && !Number(message.read_status))) await markRead();
    } catch (error) {
      if (initial) toast(apiError(error), 'error');
    }
  }, [ticketId, room, user.id, markRead, toast]);

  useEffect(() => {
    let active = true;
    latestId.current = 0;
    setMessages([]);
    const initialLoad = async () => { if (active) await loadMessages(true); };
    initialLoad();
    const timer = window.setInterval(() => { if (active) loadMessages(false); }, 2000);
    return () => { active = false; window.clearInterval(timer); };
  }, [key, loadMessages]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages]);

  const send = async () => {
    const parsed = chatSchema.safeParse({ message: text });
    if (!parsed.success || sending || isClosed) return;
    setSending(true);
    try {
      const { data } = await api.post(`/chat/${ticketId}/${room}/messages`, { message: parsed.data.message });
      setMessages((prev) => prev.some((m) => m.id === data.id) ? prev : [...prev, data]);
      latestId.current = Math.max(latestId.current, Number(data.id));
      setText('');
    } catch (error) {
      toast(apiError(error), 'error');
    } finally {
      setSending(false);
    }
  };

  const initials = (thread.counterpart || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Paper className="chat-panel" variant="outlined">
      <Box className="chat-header">
        <Avatar className="chat-avatar">{initials}</Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography fontWeight={750} noWrap>{thread.counterpart}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>Ticket #{ticketId} · {thread.subject}</Typography>
        </Box>
        <Chip
          size="small"
          label={isClosed ? 'Ticket closed · Read only' : 'Private conversation'}
          color={isClosed ? 'default' : 'primary'}
          className="soft-chip"
        />
      </Box>

      <Box className="chat-messages">
        {messages.length === 0 && (
          <Box className="chat-empty">
            <Box className="chat-empty-icon">✦</Box>
            <Typography fontWeight={700}>{isClosed ? 'No messages in this conversation' : 'Start the conversation'}</Typography>
            <Typography variant="body2" color="text.secondary">
              {isClosed ? 'This ticket is closed. The conversation is read-only.' : 'Messages will appear here. Replies refresh automatically.'}
            </Typography>
          </Box>
        )}
        <Stack spacing={1.5}>
          {messages.map((message) => {
            const mine = Number(message.sender_id) === Number(user.id);
            return (
              <Box key={message.id} className={`message-row ${mine ? 'mine' : 'theirs'}`}>
                <Box className={`message-bubble ${mine ? 'mine' : 'theirs'}`}>
                  {!mine && <Typography className="message-sender">{message.sender_name}</Typography>}
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{message.message}</Typography>
                </Box>
                <Stack direction="row" spacing={0.5} alignItems="center" className="message-meta">
                  <Typography variant="caption">{new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Typography>
                  {mine && (message.read_status ? <DoneAllRoundedIcon fontSize="inherit" /> : <DoneRoundedIcon fontSize="inherit" />)}
                </Stack>
              </Box>
            );
          })}
        </Stack>
        <div ref={bottomRef} />
      </Box>

      <Box className="chat-composer">
        <TextField fullWidth multiline maxRows={4}
          placeholder={isClosed ? 'This ticket is closed. Chat is read-only.' : 'Write a message…'}
          value={text}
          disabled={isClosed}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (!isClosed && event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              send();
            }
          }}
          inputProps={{ maxLength: 2000 }} />
        <IconButton className="send-button" onClick={send}
          disabled={isClosed || !text.trim() || sending} aria-label="Send message">
          <SendRoundedIcon />
        </IconButton>
      </Box>
      <Typography className="chat-footnote">
        {isClosed ? 'This ticket is closed. You can view previous messages but cannot send new ones.' : 'Press Enter to send · Shift + Enter for a new line'}
      </Typography>
    </Paper>
  );
}
