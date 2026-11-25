import { useCallback, useEffect, useState } from 'react';
import { Avatar, Badge, Box, Chip, List, ListItemButton, ListItemText, Paper, Stack, Typography } from '@mui/material';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import api, { apiError } from '../api/axios';
import { useToast } from '../context/ToastContext';
import ChatWindow from '../components/ChatWindow';

const ROOM_LABEL = { CUSTOMER_AGENT: 'Customer chat', MANAGER_AGENT: 'Manager chat' };

export default function Chat() {
  const toast = useToast();
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);

  const loadThreads = useCallback(async (quiet = false) => {
    try {
      const { data } = await api.get('/chat/threads');
      setThreads(data);
      setSelected((current) => {
        if (!current) return null;
        const match = data.find((thread) => thread.ticketId === current.ticketId && thread.room === current.room);
        if (!match) return current;
        // Keep ticket status in sync so an open chat becomes read-only as soon as it closes.
        return { ...current, ...match };
      });
    } catch (error) {
      if (!quiet) toast(apiError(error), 'error');
    }
  }, [toast]);

  useEffect(() => {
    loadThreads();
    const timer = window.setInterval(() => loadThreads(true), 5000);
    return () => window.clearInterval(timer);
  }, [loadThreads]);

  const selectThread = (thread) => {
    setSelected(thread);
    setThreads((prev) => prev.map((item) => item.ticketId === thread.ticketId && item.room === thread.room ? { ...item, unread: 0 } : item));
  };

  const clearUnread = useCallback(() => {
    setThreads((prev) => prev.map((item) => item.ticketId === selected?.ticketId && item.room === selected?.room ? { ...item, unread: 0 } : item));
  }, [selected]);

  return (
    <Box className="page-shell">
      <Box className="page-heading">
        <Box>
          <Typography className="eyebrow">COMMUNICATION</Typography>
          <Typography variant="h4">Inbox</Typography>
          <Typography color="text.secondary">Keep every ticket conversation in one place.</Typography>
        </Box>
        <Chip icon={<ForumRoundedIcon />} label={`${threads.length} conversations`} className="soft-chip" />
      </Box>
      <Box className="chat-layout">
        <Paper className="conversation-list" variant="outlined">
          <Box className="conversation-list-heading">
            <Typography fontWeight={800}>Messages</Typography>
            <Typography variant="caption" color="text.secondary">Updates automatically</Typography>
          </Box>
          {threads.length === 0 ? (
            <Box className="conversation-empty">
              <ForumRoundedIcon />
              <Typography fontWeight={700}>No conversations yet</Typography>
              <Typography variant="body2" color="text.secondary">A chat appears after a ticket is assigned to an agent.</Typography>
            </Box>
          ) : (
            <List disablePadding>
              {threads.map((thread) => {
                const active = selected?.ticketId === thread.ticketId && selected?.room === thread.room;
                const initials = (thread.counterpart || 'U').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
                return (
                  <ListItemButton key={`${thread.ticketId}-${thread.room}`} selected={active} onClick={() => selectThread(thread)} className="conversation-item">
                    <Avatar className="conversation-avatar">{initials}</Avatar>
                    <ListItemText
                      primary={<Typography fontWeight={750} noWrap>{thread.counterpart}</Typography>}
                      secondary={<><Typography component="span" variant="caption" display="block" noWrap>#{thread.ticketId} · {thread.subject}</Typography><Typography component="span" variant="caption" color="text.secondary">{ROOM_LABEL[thread.room]}</Typography></>}
                    />
                    {thread.unread > 0 && <Badge badgeContent={thread.unread} color="primary" />}
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </Paper>
        {selected ? <ChatWindow key={`${selected.ticketId}-${selected.room}`} thread={selected} onRead={clearUnread} /> : (
          <Paper className="chat-placeholder" variant="outlined">
            <Box className="chat-placeholder-icon"><ForumRoundedIcon /></Box>
            <Typography variant="h6">Your conversations, simplified.</Typography>
            <Typography color="text.secondary" align="center">Select a conversation on the left to view messages and reply.</Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}
