
'use client';

import { useState } from 'react';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@mui/material';

import {
  AddRounded,
  EditRounded,
  PersonRounded
} from '@mui/icons-material';

export default function AgentManagement({
  agents = [],
  agentForm,
  setAgentForm,
  onCreateAgent,
  onUpdateAgent,
  onToggleAgent
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);

  const openCreate = () => {
    setEditingAgent(null);

    setAgentForm({
      name: '',
      email: '',
      password: ''
    });

    setDialogOpen(true);
  };

  const openEdit = (agent) => {
    setEditingAgent(agent);

    setAgentForm({
      name: agent.full_name || agent.name || '',
      email: agent.email || '',
      password: ''
    });

    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    const name = agentForm?.name?.trim();
    const email = agentForm?.email?.trim();
    const password = agentForm?.password || '';

    if (!name || !email) return;

    if (!editingAgent && password.length < 8) {
      return;
    }

    try {
      if (editingAgent) {
        await onUpdateAgent?.(editingAgent, {
          name,
          email
        });
      } else {
        await onCreateAgent?.({
          name,
          email,
          password
        });
      }

      setDialogOpen(false);
      setEditingAgent(null);
    } catch (error) {
      // Keep the dialog open if the API request fails.
      console.error('Agent save failed:', error);
    }
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAgent(null);
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={900}>
            Agent management 👥
          </Typography>

          <Typography variant="body2" color="text.secondary">
            Manage your support team.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={openCreate}
          sx={{ borderRadius: 3 }}
        >
          Add agent
        </Button>
      </Stack>

      <Card sx={{ borderRadius: 4 }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Agent</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {agents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4}>
                      <Box textAlign="center" py={5}>
                        <PersonRounded
                          sx={{ fontSize: 42, color: 'text.secondary' }}
                        />
                        <Typography fontWeight={700}>
                          No agents found
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  agents.map((agent) => {
                    const active =
                      agent.is_active === true ||
                      agent.is_active === 1;

                    return (
                      <TableRow
                        key={agent.id || agent.agent_id}
                        hover
                      >
                        <TableCell>
                          <Stack direction="row" alignItems="center" gap={1.5}>
                            <Avatar sx={{ bgcolor: '#7158f5' }}>
                              {(agent.full_name || agent.name || 'A')
                                .charAt(0)
                                .toUpperCase()}
                            </Avatar>

                            <Typography fontWeight={700}>
                              {agent.full_name || agent.name || 'Agent'}
                            </Typography>
                          </Stack>
                        </TableCell>

                        <TableCell>{agent.email || '-'}</TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={active ? 'Active' : 'Inactive'}
                            color={active ? 'success' : 'default'}
                          />
                        </TableCell>

                        <TableCell align="right">
                          <Stack
                            direction="row"
                            justifyContent="flex-end"
                            alignItems="center"
                            gap={0.5}
                          >
                            <IconButton
                              color="primary"
                              onClick={() => openEdit(agent)}
                              title="Edit agent"
                            >
                              <EditRounded />
                            </IconButton>

                            <Button
                              size="small"
                              color={active ? 'error' : 'success'}
                              onClick={() => onToggleAgent?.(agent)}
                            >
                              {active ? 'Deactivate' : 'Activate'}
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={850}>
          {editingAgent ? 'Edit agent' : 'Add new agent'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2.5} mt={1}>
            <TextField
              label="Full name"
              fullWidth
              required
              value={agentForm?.name || ''}
              onChange={(e) =>
                setAgentForm((previous) => ({
                  ...previous,
                  name: e.target.value
                }))
              }
            />

            <TextField
              label="Email address"
              type="email"
              fullWidth
              required
              value={agentForm?.email || ''}
              onChange={(e) =>
                setAgentForm((previous) => ({
                  ...previous,
                  email: e.target.value
                }))
              }
            />

            {!editingAgent && (
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                value={agentForm?.password || ''}
                autoComplete="new-password"
                helperText="Password must contain at least 8 characters."
                inputProps={{ minLength: 8 }}
                onChange={(e) =>
                  setAgentForm((previous) => ({
                    ...previous,
                    password: e.target.value
                  }))
                }
              />
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={closeDialog}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={
              !agentForm?.name?.trim() ||
              !agentForm?.email?.trim() ||
              (!editingAgent && (agentForm?.password || '').length < 8)
            }
          >
            {editingAgent ? 'Save changes' : 'Create agent'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
