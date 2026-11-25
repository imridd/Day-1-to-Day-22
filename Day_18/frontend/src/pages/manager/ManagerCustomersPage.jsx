
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
  PeopleAltOutlined,
  CloseRounded
} from "@mui/icons-material";

import api from "../../api/axios";

const emptyForm = {
  fullName: "",
  email: "",
  phone: ""
};

function extractCustomers(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.customers)) return data.customers;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function getCustomerId(customer) {
  return customer.customerId ??
    customer.customer_id ??
    customer.id;
}

function getCustomerName(customer) {
  return customer.fullName ??
    customer.full_name ??
    customer.name ??
    "Unnamed customer";
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Something went wrong."
  );
}

export default function ManagerCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/api/customers");
      setCustomers(extractCustomers(response));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return customers;

    return customers.filter((customer) => {
      const searchableText = [
        getCustomerId(customer),
        getCustomerName(customer),
        customer.email,
        customer.phone,
        customer.phoneNumber,
        customer.phone_number
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(query);
    });
  }, [customers, search]);

  const openCreateDialog = () => {
    setEditingCustomer(null);
    setForm(emptyForm);
    setError("");
    setDialogOpen(true);
  };

  const openEditDialog = (customer) => {
    setEditingCustomer(customer);

    setForm({
      fullName: getCustomerName(customer) === "Unnamed customer"
        ? ""
        : getCustomerName(customer),
      email: customer.email ?? "",
      phone:
        customer.phone ??
        customer.phoneNumber ??
        customer.phone_number ??
        ""
    });

    setError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingCustomer(null);
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
      setError("Customer name is required.");
      return;
    }

    if (!form.email.trim()) {
      setError("Email address is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    const phone = form.phone.trim();

    if (phone && !/^[+]?[\d\s()-]{7,20}$/.test(phone)) {
      setError("Enter a valid phone number.");
      return;
    }

    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: phone || null
    };

    setSaving(true);

    try {
      if (editingCustomer) {
        await api.put(
          `/api/customers/${getCustomerId(editingCustomer)}`,
          payload
        );
      } else {
        await api.post("/api/customers", payload);
      }

      setDialogOpen(false);
      setEditingCustomer(null);
      setForm(emptyForm);
      await loadCustomers();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteCustomer) return;

    setError("");

    try {
      await api.delete(
        `/api/customers/${getCustomerId(deleteCustomer)}`
      );

      setDeleteCustomer(null);
      await loadCustomers();
    } catch (err) {
      setError(getErrorMessage(err));
      setDeleteCustomer(null);
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
            CUSTOMER MANAGEMENT
          </Typography>

          <Typography
            variant="h4"
            fontWeight={900}
            sx={{ fontFamily: "Space Grotesk" }}
          >
            Customers
          </Typography>

          <Typography color="text.secondary" fontSize={13} mt={0.5}>
            Manage customer profiles and contact information.
          </Typography>
        </Box>

        <Stack direction="row" gap={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={loadCustomers}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={openCreateDialog}
          >
            Add customer
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
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider"
            }}
          >
            <Typography color="text.secondary" fontSize={12}>
              Total customers
            </Typography>

            <Stack direction="row" alignItems="center" gap={1}>
              <Typography variant="h4" fontWeight={900}>
                {customers.length}
              </Typography>

              <PeopleAltOutlined color="primary" />
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
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
              Search results
            </Typography>

            <Typography variant="h4" fontWeight={900}>
              {filteredCustomers.length}
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
          placeholder="Search by customer name, email, phone or ID..."
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
              Loading customers...
            </Typography>
          </Box>
        ) : filteredCustomers.length === 0 ? (
          <Box py={7} textAlign="center">
            <PeopleAltOutlined
              sx={{ fontSize: 45, color: "text.secondary", mb: 1 }}
            />

            <Typography fontWeight={800}>
              No customers found
            </Typography>

            <Typography color="text.secondary" fontSize={13} mt={0.5}>
              Try another search or create a customer profile.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  {["Customer", "Customer ID", "Phone", "Email", "Actions"].map(
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
                {filteredCustomers.map((customer, index) => {
                  const name = getCustomerName(customer);

                  return (
                    <TableRow
                      hover
                      key={getCustomerId(customer) ?? index}
                    >
                      <TableCell>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                          <Avatar
                            sx={{
                              bgcolor: "secondary.main",
                              width: 38,
                              height: 38,
                              fontSize: 14,
                              fontWeight: 800
                            }}
                          >
                            {name.charAt(0).toUpperCase()}
                          </Avatar>

                          <Box>
                            <Typography fontSize={13} fontWeight={800}>
                              {name}
                            </Typography>

                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Customer
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell>
                        <Chip
                          size="small"
                          label={`#${getCustomerId(customer) ?? "N/A"}`}
                          variant="outlined"
                        />
                      </TableCell>

                      <TableCell>
                        <Typography fontSize={12}>
                          {customer.phone ??
                            customer.phoneNumber ??
                            customer.phone_number ??
                            "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography fontSize={12}>
                          {customer.email || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Stack direction="row" gap={0.5}>
                          <IconButton
                            size="small"
                            color="primary"
                            aria-label="Edit customer"
                            onClick={() => openEditDialog(customer)}
                          >
                            <EditRounded fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            color="error"
                            aria-label="Delete customer"
                            onClick={() => setDeleteCustomer(customer)}
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
                  {editingCustomer ? "Edit customer" : "Add customer"}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Enter customer contact information.
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
                label="Phone number"
                fullWidth
                value={form.phone}
                onChange={(event) =>
                  updateField("phone", event.target.value)
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
                : editingCustomer
                  ? "Save changes"
                  : "Create customer"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog
        open={Boolean(deleteCustomer)}
        onClose={() => setDeleteCustomer(null)}
      >
        <DialogTitle fontWeight={900}>
          Delete customer?
        </DialogTitle>

        <DialogContent>
          <Typography fontSize={14}>
            Are you sure you want to delete{" "}
            <strong>
              {deleteCustomer ? getCustomerName(deleteCustomer) : ""}
            </strong>
            ? The backend may prevent deletion if this customer has existing
            tickets.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteCustomer(null)}>
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
