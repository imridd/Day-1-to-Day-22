
'use client';

import { useState, useEffect } from 'react';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';

import {
  CloseRounded,
  SendRounded,
  HistoryRounded,
  AssignmentIndRounded,
  CircleRounded
} from '@mui/icons-material';

import {
  STATUS_LABELS,
  STATUS_COLORS,
  CHAT_CHANNELS
} from '../../constants/dashboard';

export default function TicketDialog({
  open,
  selected,
  detail,
  onClose,

  manager = false,
  agent = false,
  customer = false,
  showCustomerPresence = false,

  agents = [],
  assignment,
  setAssignment,

  chatChannel,
  setChatChannel,
  chat = [],
  sendChat,

  activity = [],

  action,
  canChat = false,
  canViewInternalChat = false,
  loading = false
}) {
  const [message, setMessage] = useState('');
  const [activityText, setActivityText] = useState('');
  const [activeTab, setActiveTab] = useState('details');
  const [actionLoading, setActionLoading] = useState(false);

  // Local assignment selection
  const [selectedAgentId, setSelectedAgentId] = useState('');

  // Ticket data
  const ticket = detail?.ticket || selected;

  // Current assigned agent ID
  const currentAssignedAgentId =
    ticket?.assigned_agent_id ??
    ticket?.agent_id ??
    ticket?.assignedAgentId ??
    '';

  const currentAgentId = String(currentAssignedAgentId);

  // CUSTOMER PRESENCE

  const getCustomerPresence = () => {
    const value = ticket?.customer_online;

    if (
      value === true ||
      value === 1 ||
      value === '1' ||
      value === 'true'
    ) {
      return 'ONLINE';
    }

    if (
      value === false ||
      value === 0 ||
      value === '0' ||
      value === 'false'
    ) {
      return 'OFFLINE';
    }

    return 'UNKNOWN';
  };

  const customerPresence = getCustomerPresence();

  // -----------------------------------
  // CHAT CHANNEL PERMISSIONS
  // -----------------------------------

  const canShowInternalTab =
    (agent || manager) && canViewInternalChat;

  const canShowCustomerTab =
    agent && canChat;

  const availableChannels = [
    ...(canShowCustomerTab
      ? [CHAT_CHANNELS.CUSTOMER]
      : []),

    ...(canShowInternalTab
      ? [CHAT_CHANNELS.INTERNAL]
      : [])
  ];

  const selectedChatChannel = manager
    ? (
        canShowInternalTab
          ? CHAT_CHANNELS.INTERNAL
          : ''
      )
    : availableChannels.includes(chatChannel)
      ? chatChannel
      : availableChannels[0] || '';

  // -----------------------------------
  // INITIALIZE / SYNC ASSIGNMENT
  // -----------------------------------

  useEffect(() => {
    if (!open || !ticket) return;

    setSelectedAgentId(
      currentAssignedAgentId === null ||
      currentAssignedAgentId === undefined
        ? ''
        : String(currentAssignedAgentId)
    );
  }, [
    open,
    ticket?.id,
    currentAssignedAgentId
  ]);

  // -----------------------------------
  // SYNC CHAT CHANNEL
  // -----------------------------------

  useEffect(() => {
    if (
      !manager &&
      selectedChatChannel &&
      chatChannel !== selectedChatChannel
    ) {
      setChatChannel?.(selectedChatChannel);
    }
  }, [
    manager,
    selectedChatChannel,
    chatChannel,
    setChatChannel
  ]);

  // -----------------------------------
  // CONDITIONAL RETURN AFTER HOOKS
  // -----------------------------------

  if (!ticket) return null;

  const status = ticket.status || 'OPEN';

  const isInternal =
    selectedChatChannel === CHAT_CHANNELS.INTERNAL;

  // -----------------------------------
  // MESSAGE PERMISSIONS
  // -----------------------------------

  const canSendMessage = manager
    ? isInternal && canViewInternalChat
    : isInternal
      ? canViewInternalChat
      : canChat;

  const isReadOnly = [
    'COMPLETED',
    'RESOLVED',
    'CLOSED'
  ].includes(status);

  // -----------------------------------
  // STATUS / ASSIGNMENT ACTION
  // -----------------------------------

  const runAction = async (
    path,
    method = 'PATCH',
    body
  ) => {
    if (!action || actionLoading) return false;

    setActionLoading(true);

    try {
      const success = await action(path, method, body);
      return success;
    } catch (error) {
      console.error('Ticket action failed:', error);
      return false;
    } finally {
      setActionLoading(false);
    }
  };

  // -----------------------------------
  // CHAT
  // -----------------------------------

  const submitChat = async (event) => {
    event.preventDefault();

    const trimmedMessage = message.trim();

    if (
      !trimmedMessage ||
      !canSendMessage ||
      isReadOnly ||
      loading
    ) {
      return;
    }

    const sent = await sendChat?.(
      event,
      trimmedMessage
    );

    if (sent) {
      setMessage('');
    }
  };

  // -----------------------------------
  // ACTIVITY
  // -----------------------------------

  const submitActivity = async () => {
    const trimmed = activityText.trim();

    if (!trimmed) return;

    const success = await runAction(
      `/tickets/${ticket.id}/activities`,
      'POST',
      { activity: trimmed }
    );

    if (success) {
      setActivityText('');
    }
  };

  // -----------------------------------
  // ASSIGNMENT
  // -----------------------------------

  const updateAssignment = (value) => {
    setSelectedAgentId(String(value));

    setAssignment?.(current => ({
      ...current,
      agentId: value === '' ? null : value
    }));
  };

  const assignmentChanged =
    selectedAgentId !== currentAgentId;

  const assignAgent = async () => {
    if (!assignmentChanged || actionLoading) return;

    const agentId =
      selectedAgentId === ''
        ? null
        : selectedAgentId;

    const success = await runAction(
      `/tickets/${ticket.id}/assign`,
      'PATCH',
      { agentId }
    );

    if (success) {
      setAssignment?.(current => ({
        ...current,
        agentId
      }));
    }
  };

  const assignmentButtonLabel = !assignmentChanged
    ? selectedAgentId === ''
      ? 'Unassigned'
      : 'Assigned'
    : selectedAgentId === ''
      ? 'Leave unassigned'
      : currentAssignedAgentId
        ? 'Update assignment'
        : 'Assign';

  // -----------------------------------
  // STATUS CHANGE HELPER
  // -----------------------------------

  const changeStatus = async (nextStatus) => {
    await runAction(
      `/tickets/${ticket.id}/status`,
      'PATCH',
      {
        status: nextStatus
      }
    );
  };

  // -----------------------------------
  // MANAGER STATUS BUTTONS
  // -----------------------------------

  const renderManagerActions = () => {
    switch (status) {
      case 'OPEN':
      case 'REOPENED':
        return (
          <Button
            variant="contained"
            color="primary"
            disabled={actionLoading}
            onClick={() => changeStatus('IN_PROGRESS')}
          >
            Start Working
          </Button>
        );

      case 'HOLD_REQUESTED':
        return (
          <Button
            variant="contained"
            color="warning"
            disabled={actionLoading}
            onClick={() => changeStatus('ON_HOLD')}
          >
            Approve Hold
          </Button>
        );

      case 'ON_HOLD':
        return (
          <Button
            variant="outlined"
            color="primary"
            disabled={actionLoading}
            onClick={() => changeStatus('OPEN')}
          >
            Reopen Ticket
          </Button>
        );

      case 'COMPLETED':
        return (
          <Button
            variant="contained"
            color="success"
            disabled={actionLoading}
            onClick={() => changeStatus('RESOLVED')}
          >
            Resolve Ticket
          </Button>
        );

      case 'RESOLVED':
        return (
          <Button
            variant="outlined"
            color="success"
            disabled={actionLoading}
            onClick={() => changeStatus('CLOSED')}
          >
            Close Ticket
          </Button>
        );

      default:
        return (
          <Typography
            variant="body2"
            color="text.secondary"
          >
            No manager action available for this status.
          </Typography>
        );
    }
  };

  // -----------------------------------
  // UI
  // -----------------------------------

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 4,
          minHeight: { xs: '90vh', md: 620 }
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 2,
          p: 3
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={900}>
            {ticket.ticket_no ||
              ticket.ticket_number ||
              `Ticket #${ticket.id}`}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            mt={0.5}
          >
            {ticket.title ||
              ticket.issue ||
              'Ticket details'}
          </Typography>

          <Stack direction="row" spacing={1} mt={1.5}>
            <Chip
              size="small"
              label={STATUS_LABELS[status] || status}
              color={STATUS_COLORS[status] || 'default'}
            />

            <Chip
              size="small"
              label={ticket.priority || 'Normal'}
              variant="outlined"
            />
          </Stack>
        </Box>

        <IconButton onClick={onClose}>
          <CloseRounded />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: { xs: 2, md: 3 } }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ mb: 3 }}
          variant="scrollable"
        >
          <Tab value="details" label="Details" />
          <Tab value="chat" label="Conversation" />
          <Tab value="activity" label="Activity" />
        </Tabs>

        {activeTab === 'details' && (
          <Stack spacing={2.5}>
            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 3 }}
            >
              <Typography fontWeight={850} mb={1}>
                Issue description
              </Typography>

              <Typography variant="body2" color="text.secondary">
                {ticket.description || 'No description provided.'}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                <Typography variant="body2">
                  <b>Customer:</b> {ticket.customer_name || '-'}
                </Typography>

                {/* CUSTOMER ONLINE / OFFLINE STATUS */}

                {showCustomerPresence && (
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography variant="body2">
                      <b>Customer status:</b>
                    </Typography>

                    {customerPresence === 'ONLINE' && (
                      <Chip
                        size="small"
                        icon={<CircleRounded sx={{ fontSize: '9px !important' }} />}
                        label="Online"
                        color="success"
                        variant="outlined"
                      />
                    )}

                    {customerPresence === 'OFFLINE' && (
                      <Chip
                        size="small"
                        icon={<CircleRounded sx={{ fontSize: '9px !important' }} />}
                        label="Offline"
                        color="default"
                        variant="outlined"
                      />
                    )}

                    {customerPresence === 'UNKNOWN' && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        Unavailable
                      </Typography>
                    )}
                  </Stack>
                )}

                <Typography variant="body2">
                  <b>Assigned agent:</b>{' '}
                  {ticket.agent_name ||
                    ticket.assigned_agent_name ||
                    'Unassigned'}
                </Typography>

                <Typography variant="body2">
                  <b>Created:</b>{' '}
                  {ticket.created_at
                    ? new Date(ticket.created_at).toLocaleString()
                    : '-'}
                </Typography>
              </Stack>
            </Paper>

            {manager && (
              <Paper
                variant="outlined"
                sx={{ p: 2.5, borderRadius: 3 }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  gap={1}
                  mb={2}
                >
                  <AssignmentIndRounded color="primary" />
                  <Typography fontWeight={850}>
                    Manager controls
                  </Typography>
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                >
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Assign agent"
                    value={selectedAgentId}
                    onChange={e => updateAssignment(e.target.value)}
                    disabled={actionLoading || loading}
                    SelectProps={{
                      displayEmpty: true
                    }}
                    sx={{
                      minWidth: 0,
                      '& .MuiSelect-select': {
                        textAlign: 'left'
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>Leave unassigned</em>
                    </MenuItem>

                    {agents.map(agentItem => {
                      const agentId =
                        agentItem.id ?? agentItem.agent_id;

                      if (
                        agentId === null ||
                        agentId === undefined
                      ) {
                        return null;
                      }

                      const agentName =
                        agentItem.name ||
                        agentItem.full_name ||
                        agentItem.email ||
                        `Agent ${agentId}`;

                      return (
                        <MenuItem
                          key={agentId}
                          value={String(agentId)}
                        >
                          {agentName}
                        </MenuItem>
                      );
                    })}
                  </TextField>

                  <Button
                    variant="contained"
                    color={
                      !assignmentChanged
                        ? 'success'
                        : selectedAgentId === ''
                          ? 'warning'
                          : 'primary'
                    }
                    disabled={
                      !assignmentChanged ||
                      actionLoading ||
                      loading
                    }
                    onClick={assignAgent}
                    sx={{
                      minWidth: { xs: '100%', sm: 160 },
                      minHeight: 40,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {actionLoading
                      ? 'Saving...'
                      : assignmentButtonLabel}
                  </Button>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mt={1}
                >
                  {assignmentChanged
                    ? selectedAgentId === ''
                      ? 'This ticket will be left unassigned.'
                      : 'Save to update the assigned agent.'
                    : selectedAgentId === ''
                      ? 'No agent is currently assigned.'
                      : 'This ticket is already assigned to the selected agent.'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography fontWeight={750} fontSize={14} mb={1.5}>
                  Ticket status actions
                </Typography>

                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {renderManagerActions()}
                </Stack>

                {actionLoading && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mt={1}
                  >
                    Processing action...
                  </Typography>
                )}
              </Paper>
            )}

            {agent && (
              <Paper
                variant="outlined"
                sx={{ p: 2.5, borderRadius: 3 }}
              >
                <Typography fontWeight={850} mb={2}>
                  Agent actions
                </Typography>

                <Stack spacing={1.5}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Work log"
                    placeholder="Describe the work completed..."
                    value={activityText}
                    onChange={e => setActivityText(e.target.value)}
                  />

                  <Button
                    variant="outlined"
                    disabled={!activityText.trim() || actionLoading}
                    onClick={submitActivity}
                  >
                    Add work log
                  </Button>

                  <Divider />

                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {![
                      'COMPLETED',
                      'RESOLVED',
                      'CLOSED'
                    ].includes(status) && (
                      <Button
                        color="success"
                        variant="contained"
                        disabled={actionLoading}
                        onClick={() => changeStatus('COMPLETED')}
                      >
                        Mark Completed
                      </Button>
                    )}

                    {![
                      'HOLD_REQUESTED',
                      'ON_HOLD',
                      'COMPLETED',
                      'RESOLVED',
                      'CLOSED'
                    ].includes(status) && (
                      <Button
                        color="warning"
                        variant="outlined"
                        disabled={actionLoading}
                        onClick={() => changeStatus('HOLD_REQUESTED')}
                      >
                        Request Hold
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            )}

            {customer && status === 'RESOLVED' && (
              <Button
                variant="outlined"
                disabled={actionLoading}
                onClick={() => changeStatus('REOPEN')}
              >
                Reopen Ticket
              </Button>
            )}
          </Stack>
        )}

        {activeTab === 'chat' && (
          <Stack spacing={2}>
            {(agent || manager) && availableChannels.length > 0 && (
              <Tabs
                value={selectedChatChannel}
                onChange={(_, value) => setChatChannel?.(value)}
              >
                {canShowCustomerTab && (
                  <Tab
                    value={CHAT_CHANNELS.CUSTOMER}
                    label="Customer chat"
                  />
                )}

                {canShowInternalTab && (
                  <Tab
                    value={CHAT_CHANNELS.INTERNAL}
                    label="Internal chat"
                  />
                )}
              </Tabs>
            )}

            {manager && !canShowInternalTab && (
              <Typography variant="body2" color="text.secondary">
                You do not have permission to view internal chat.
              </Typography>
            )}

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                height: 340,
                overflowY: 'auto',
                borderRadius: 3,
                bgcolor: 'background.default'
              }}
            >
              {loading ? (
                <Box
                  height="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography color="text.secondary">
                    Loading conversation...
                  </Typography>
                </Box>
              ) : chat.length === 0 ? (
                <Box
                  height="100%"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography color="text.secondary">
                    No messages yet.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {chat.map((item, index) => {
                    const sender =
                      item.sender_name ||
                      item.name ||
                      'User';

                    return (
                      <Box
                        key={item.id || index}
                        display="flex"
                        gap={1.5}
                        alignItems="flex-start"
                      >
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            fontSize: 14
                          }}
                        >
                          {sender.charAt(0).toUpperCase()}
                        </Avatar>

                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={800} fontSize={13}>
                            {sender}
                          </Typography>

                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              mt: 0.5,
                              borderRadius: 2,
                              maxWidth: 440,
                              overflowWrap: 'anywhere'
                            }}
                          >
                            <Typography variant="body2">
                              {item.message || item.content || ''}
                            </Typography>
                          </Paper>

                          {item.created_at && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(item.created_at).toLocaleString()}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </Paper>

            {!canSendMessage && (
              <Typography variant="caption" color="text.secondary">
                You do not have permission to send messages in this channel.
              </Typography>
            )}

            {isReadOnly && (
              <Typography variant="caption" color="text.secondary">
                This conversation is read-only because the ticket is closed or completed.
              </Typography>
            )}

            <Box
              component="form"
              onSubmit={submitChat}
              display="flex"
              gap={1}
            >
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                disabled={!canSendMessage || isReadOnly || loading}
              />

              <Button
                type="submit"
                variant="contained"
                disabled={
                  !canSendMessage ||
                  isReadOnly ||
                  loading ||
                  !message.trim()
                }
                sx={{ minWidth: 48 }}
              >
                <SendRounded />
              </Button>
            </Box>
          </Stack>
        )}

        {activeTab === 'activity' && (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" gap={1}>
              <HistoryRounded color="primary" />
              <Typography fontWeight={850}>
                Ticket activity history
              </Typography>
            </Stack>

            {activity.length === 0 ? (
              <Typography color="text.secondary">
                No activity recorded yet.
              </Typography>
            ) : (
              activity.map((item, index) => (
                <Box
                  key={item.id || index}
                  sx={{
                    borderLeft: '3px solid',
                    borderColor: 'primary.main',
                    pl: 2,
                    py: 0.5
                  }}
                >
                  <Typography fontWeight={750}>
                    {item.action ||
                      item.activity ||
                      item.message ||
                      item.description ||
                      'Activity'}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {item.user_name || item.actor_name || 'System'}
                    {' · '}
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : ''}
                  </Typography>
                </Box>
              ))
            )}
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
