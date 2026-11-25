
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
  BusinessOutlined,
  CloseRounded
} from "@mui/icons-material";

import api from "../../api/axios";

const emptyForm = {
  name: "",
  description: ""
};

function extractDepartments(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.departments)) return data.departments;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getDepartmentId(department) {
  return (
    department.departmentId ??
    department.department_id ??
    department.id
  );
}

function getDepartmentName(department) {
  return (
    department.name ??
    department.departmentName ??
    department.department_name ??
    "Unnamed department"
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

export default function ManagerDepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [deleteDepartment, setDeleteDepartment] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/departments");
      setDepartments(extractDepartments(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return departments;

    return departments.filter((department) => {
      const searchable = [
        getDepartmentId(department),
        getDepartmentName(department),
        department.description
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [departments, search]);

  const openCreateDialog = () => {
    setEditingDepartment(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (department) => {
    setEditingDepartment(department);

    setForm({
      name: getDepartmentName(department),
      description: department.description ?? ""
    });

    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingDepartment(null);
    setForm(emptyForm);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Department name is required.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim()
    };

    setSaving(true);

    try {
      if (editingDepartment) {
        await api.put(
          `/api/departments/${getDepartmentId(editingDepartment)}`,
          payload
        );
      } else {
        await api.post("/api/departments", payload);
      }

      setDialogOpen(false);
      setEditingDepartment(null);
      setForm(emptyForm);
      await loadDepartments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDepartment) return;

    setError("");

    try {
      await api.delete(
        `/api/departments/${getDepartmentId(deleteDepartment)}`
      );

      setDeleteDepartment(null);
      await loadDepartments();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleteDepartment(null);
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
            ORGANIZATION
          </Typography>

          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ fontFamily: "Space Grotesk" }}
          >
            Departments
          </Typography>

          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Organize your support teams and service areas.
          </Typography>
        </Box>

        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={loadDepartments}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={openCreateDialog}
          >
            Add department
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2} mb={2}>
        <Grid item xs={12} sm={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3
            }}
          >
            <Typography color="text.secondary" fontSize={12}>
              Total departments
            </Typography>

            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="h4" fontWeight={900}>
                {departments.length}
              </Typography>

              <BusinessOutlined color="primary" />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 3
            }}
          >
            <Typography color="text.secondary" fontSize={12}>
              Search results
            </Typography>

            <Typography variant="h4" fontWeight={900}>
              {filteredDepartments.length}
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
          placeholder="Search department by name, ID or description..."
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
              Loading departments...
            </Typography>
          </Box>
        ) : filteredDepartments.length === 0 ? (
          <Box py={7} textAlign="center">
            <BusinessOutlined
              sx={{ fontSize: 45, color: "text.secondary", mb: 1 }}
            />

            <Typography fontWeight={800}>
              No departments found
            </Typography>

            <Typography color="text.secondary" fontSize={13} mt={0.5}>
              Try another search or create a department.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  {["Department", "Department ID", "Description", "Actions"].map(
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
                {filteredDepartments.map((department, index) => {
                  const name = getDepartmentName(department);

                  return (
                    <TableRow
                      hover
                      key={getDepartmentId(department) ?? index}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar
                            sx={{
                              bgcolor: "primary.main",
                              width: 38,
                              height: 38
                            }}
                          >
                            <BusinessOutlined fontSize="small" />
                          </Avatar>

                          <Typography fontWeight={800} fontSize={13}>
                            {name}
                          </Typography>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={`#${getDepartmentId(department) ?? "N/A"}`}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography
                          fontSize={12}
                          color="text.secondary"
                          sx={{ maxWidth: 300 }}
                        >
                          {department.description || "No description"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" gap={0.5}>
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label="Edit department"
                            onClick={() => openEditDialog(department)}
                          >
                            <EditRounded fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Delete department"
                            onClick={() => setDeleteDepartment(department)}
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
                  {editingDepartment ? "Edit department" : "Create department"}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Enter the department details below.
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
                label="Department name"
                fullWidth
                required
                value={form.name}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    name: event.target.value
                  }))
                }
              />

              <TextField
                label="Description"
                fullWidth
                multiline
                minRows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((previous) => ({
                    ...previous,
                    description: event.target.value
                  }))
                }
              />
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
              {saving
                ? "Saving..."
                : editingDepartment
                  ? "Save changes"
                  : "Create department"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(deleteDepartment)}
        onClose={() => setDeleteDepartment(null)}
      >
        <DialogTitle fontWeight={900}>
          Delete department?
        </DialogTitle>

        <DialogContent>
          <Typography fontSize={14}>
            Are you sure you want to delete{" "}
            <strong>
              {deleteDepartment
                ? getDepartmentName(deleteDepartment)
                : ""}
            </strong>
            ? The backend may reject deletion if agents or tickets still
            reference this department.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDepartment(null)}>
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
