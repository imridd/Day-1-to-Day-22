
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography
} from "@mui/material";

import {
  AddRounded,
  SearchRounded,
  RefreshRounded,
  EditRounded,
  DeleteOutlineRounded,
  GroupsOutlined,
  CloseRounded
} from "@mui/icons-material";

import api from "../../api/axios";

const emptyForm = {
  fullName: "",
  email: "",
  role: "Agent",
  departmentId: "",
  isActive: true
};

function extractList(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.agents)) return data.agents;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getAgentId(agent) {
  return agent.agentId ?? agent.agent_id ?? agent.id;
}

function getAgentName(agent) {
  return agent.fullName ?? agent.full_name ?? agent.name ?? "Unnamed agent";
}

function getDepartment(agent) {
  return (
    agent.departmentName ??
    agent.department_name ??
    agent.department?.name ??
    agent.departmentId ??
    agent.department_id ??
    "—"
  );
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Something went wrong."
  );
}

export default function ManagerAgentsPage() {
  const [agents, setAgents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [deleteAgent, setDeleteAgent] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [agentResponse, departmentResponse] = await Promise.all([
        api.get("/api/agents"),
        api.get("/api/departments")
      ]);

      setAgents(extractList(agentResponse));
      setDepartments(extractList(departmentResponse));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return agents;

    return agents.filter((agent) => {
      const text = [
        getAgentId(agent),
        getAgentName(agent),
        agent.email,
        agent.role,
        getDepartment(agent)
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(query);
    });
  }, [agents, search]);

  const openCreateDialog = () => {
    setEditingAgent(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (agent) => {
    setEditingAgent(agent);

    setForm({
      fullName: getAgentName(agent) === "Unnamed agent" ? "" : getAgentName(agent),
      email: agent.email ?? "",
      role: agent.role ?? "Agent",
      departmentId:
        agent.departmentId ?? agent.department_id ?? "",
      isActive: agent.isActive ?? agent.is_active ?? true
    });

    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingAgent(null);
    setForm(emptyForm);
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.fullName.trim()) {
      setError("Agent name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (!form.departmentId) {
      setError("Please select a department.");
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      role: form.role,
      departmentId: Number(form.departmentId),
      isActive: Boolean(form.isActive)
    };

    setSaving(true);

    try {
      if (editingAgent) {
        await api.put(
          `/api/agents/${getAgentId(editingAgent)}`,
          payload
        );
      } else {
        await api.post("/api/agents", payload);
      }

      setDialogOpen(false);
      setEditingAgent(null);
      setForm(emptyForm);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAgent) return;

    setError("");

    try {
      await api.delete(`/api/agents/${getAgentId(deleteAgent)}`);

      setDeleteAgent(null);
      await loadData();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleteAgent(null);
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        gap={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="overline"
            color="primary.main"
            fontWeight={800}
            letterSpacing={2}
          >
            TEAM MANAGEMENT
          </Typography>

          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ fontFamily: "Space Grotesk" }}
          >
            Support agents
          </Typography>

          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Manage your support team and department assignments.
          </Typography>
        </Box>

        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={loadData}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={openCreateDialog}
          >
            Add agent
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Typography color="text.secondary" fontSize={12}>
              Total agents
            </Typography>
            <Typography variant="h4" fontWeight={900}>
              {agents.length}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Typography color="text.secondary" fontSize={12}>
              Active agents
            </Typography>
            <Typography variant="h4" fontWeight={900}>
              {
                agents.filter((agent) =>
                  Boolean(agent.isActive ?? agent.is_active ?? true)
                ).length
              }
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={4}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Typography color="text.secondary" fontSize={12}>
              Departments
            </Typography>
            <Typography variant="h4" fontWeight={900}>
              {departments.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2.5 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "19px"
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Search agents by name, email, ID or department..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          sx={{ mb: 2.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" />
              </InputAdornment>
            )
          }}
        />

        {loading ? (
          <Box py={7} textAlign="center">
            <CircularProgress size={30} />
            <Typography color="text.secondary" mt={2} fontSize={13}>
              Loading agents...
            </Typography>
          </Box>
        ) : filteredAgents.length === 0 ? (
          <Box py={7} textAlign="center">
            <GroupsOutlined
              sx={{ fontSize: 45, color: "text.secondary", mb: 1 }}
            />
            <Typography fontWeight={800}>No agents found</Typography>
            <Typography color="text.secondary" fontSize={13} mt={0.5}>
              Try another search or add a new agent.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 750 }}>
              <TableHead>
                <TableRow>
                  {["Agent", "Role", "Department", "Status", "Actions"].map(
                    (heading) => (
                      <TableCell
                        key={heading}
                        sx={{
                          fontSize: 11,
                          fontWeight: 900,
                          color: "text.secondary"
                        }}
                      >
                        {heading.toUpperCase()}
                      </TableCell>
                    )
                  )}
                </TableRow>
              </TableHead>

              <TableBody>
                {filteredAgents.map((agent, index) => {
                  const active = Boolean(
                    agent.isActive ?? agent.is_active ?? true
                  );

                  return (
                    <TableRow
                      hover
                      key={getAgentId(agent) ?? index}
                    >
                      <TableCell>
                        <Stack direction="row" gap={1.5} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: "primary.main",
                              width: 38,
                              height: 38,
                              fontSize: 14,
                              fontWeight: 800
                            }}
                          >
                            {getAgentName(agent).charAt(0).toUpperCase()}
                          </Avatar>

                          <Box>
                            <Typography fontWeight={800} fontSize={13}>
                              {getAgentName(agent)}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {agent.email || "No email"}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={agent.role || "Agent"}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography fontSize={12}>
                          {getDepartment(agent)}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={active ? "Active" : "Inactive"}
                          size="small"
                          color={active ? "success" : "default"}
                        />
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" gap={0.5}>
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label="Edit agent"
                            onClick={() => openEditDialog(agent)}
                          >
                            <EditRounded fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Delete agent"
                            onClick={() => setDeleteAgent(agent)}
                          >
                            <DeleteOutlineRounded fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSave}>
          <DialogTitle>
            <Stack direction="row" justifyContent="space-between">
              <Box>
                <Typography fontWeight={900}>
                  {editingAgent ? "Edit agent" : "Add new agent"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Enter the agent's account and team details.
                </Typography>
              </Box>

              <IconButton onClick={closeDialog} disabled={saving}>
                <CloseRounded />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent dividers>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Stack spacing={2}>
              <TextField
                label="Full name"
                fullWidth
                required
                value={form.fullName}
                onChange={(event) =>
                  updateField("fullName", event.target.value)
                }
              />

              <TextField
                label="Email address"
                type="email"
                fullWidth
                required
                value={form.email}
                onChange={(event) =>
                  updateField("email", event.target.value)
                }
              />

              <TextField
                select
                label="Role"
                fullWidth
                value={form.role}
                onChange={(event) =>
                  updateField("role", event.target.value)
                }
              >
                <MenuItem value="Agent">Agent</MenuItem>
                <MenuItem value="Manager">Manager</MenuItem>
              </TextField>

              <TextField
                select
                label="Department"
                fullWidth
                required
                value={form.departmentId}
                onChange={(event) =>
                  updateField("departmentId", event.target.value)
                }
              >
                {departments.map((department) => (
                  <MenuItem
                    key={
                      department.departmentId ??
                      department.department_id ??
                      department.id
                    }
                    value={
                      department.departmentId ??
                      department.department_id ??
                      department.id
                    }
                  >
                    {department.name ??
                      department.departmentName ??
                      department.department_name}
                  </MenuItem>
                ))}
              </TextField>

              {editingAgent && (
                <TextField
                  select
                  label="Account status"
                  fullWidth
                  value={String(form.isActive)}
                  onChange={(event) =>
                    updateField("isActive", event.target.value === "true")
                  }
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </TextField>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              disabled={saving}
            >
              {saving ? "Saving..." : editingAgent ? "Save changes" : "Create agent"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(deleteAgent)}
        onClose={() => setDeleteAgent(null)}
      >
        <DialogTitle fontWeight={900}>Delete agent?</DialogTitle>

        <DialogContent>
          <Typography fontSize={14}>
            Are you sure you want to delete{" "}
            <strong>{deleteAgent ? getAgentName(deleteAgent) : ""}</strong>?
            This action may be blocked if the agent has assigned tickets.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteAgent(null)}>
            Cancel
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
