
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";

import {
  ArrowBackRounded,
  SendRounded,
  ConfirmationNumberOutlined
} from "@mui/icons-material";

import api from "../../api/axios";

function extractList(response) {
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
  return department.name ?? department.departmentName ?? "Department";
}

export default function CustomerCreateTicketPage() {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    departmentId: ""
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const loadDepartments = async () => {
      setLoadingDepartments(true);

      try {
        const response = await api.get("/api/departments");
        setDepartments(extractList(response));
      } catch (err) {
        setApiError(
          err.response?.data?.message ||
            "Unable to load departments. Please refresh and try again."
        );
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: ""
    }));

    setApiError("");
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Please enter a ticket title.";
    } else if (form.title.trim().length < 5) {
      nextErrors.title = "Title must contain at least 5 characters.";
    } else if (form.title.trim().length > 150) {
      nextErrors.title = "Title cannot exceed 150 characters.";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Please describe your issue.";
    } else if (form.description.trim().length < 10) {
      nextErrors.description = "Please provide at least 10 characters.";
    } else if (form.description.trim().length > 5000) {
      nextErrors.description = "Description cannot exceed 5000 characters.";
    }

    if (!form.departmentId) {
      nextErrors.departmentId = "Please select a department.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate() || submitting) return;

    setSubmitting(true);
    setApiError("");

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        departmentId: form.departmentId
      };

      const response = await api.post("/api/tickets", payload);

      const result =
        response?.data?.ticket ??
        response?.data?.data ??
        response?.data;

      const ticketId =
        result?.ticketId ??
        result?.ticket_id ??
        result?.id;

      if (ticketId != null) {
        navigate(`/customer/tickets/${ticketId}`, {
          replace: true
        });
      } else {
        navigate("/customer/tickets", {
          replace: true
        });
      }
    } catch (err) {
      setApiError(
        err.response?.data?.message ||
          err.message ||
          "Ticket could not be created. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box maxWidth={850} mx="auto">
      <Button
        startIcon={<ArrowBackRounded />}
        onClick={() => navigate("/customer/tickets")}
        sx={{ mb: 2 }}
      >
        Back to my requests
      </Button>

      <Box mb={2.5}>
        <Typography
          variant="overline"
          color="primary.main"
          fontWeight={800}
          letterSpacing={2}
        >
          CUSTOMER SUPPORT
        </Typography>

        <Typography
          variant="h4"
          fontWeight={900}
          sx={{ fontFamily: "Space Grotesk" }}
        >
          Create a request
        </Typography>

        <Typography color="text.secondary" fontSize={13} mt={0.5}>
          Tell us what's happening. Our support team will take it from here.
        </Typography>
      </Box>

      {apiError && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
          {apiError}
        </Alert>
      )}

      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider"
        }}
      >
        <Stack direction="row" alignItems="center" gap={1.5} mb={3}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: "action.hover",
              color: "primary.main"
            }}
          >
            <ConfirmationNumberOutlined />
          </Box>

          <Box>
            <Typography fontWeight={900}>
              Request information
            </Typography>
            <Typography fontSize={11} color="text.secondary">
              Fields marked with * are required.
            </Typography>
          </Box>
        </Stack>

        <Stack spacing={2.5}>
          <TextField
            label="Ticket title *"
            placeholder="Example: Unable to access my account"
            fullWidth
            value={form.title}
            onChange={(event) => handleChange("title", event.target.value)}
            error={Boolean(errors.title)}
            helperText={errors.title || `${form.title.length}/150 characters`}
            inputProps={{ maxLength: 150 }}
          />

          <TextField
            label="Describe your issue *"
            placeholder="Explain what happened, what you expected, and any steps you've already tried..."
            fullWidth
            multiline
            minRows={5}
            value={form.description}
            onChange={(event) =>
              handleChange("description", event.target.value)
            }
            error={Boolean(errors.description)}
            helperText={
              errors.description ||
              `${form.description.length}/5000 characters`
            }
            inputProps={{ maxLength: 5000 }}
          />

          <FormControl fullWidth error={Boolean(errors.departmentId)}>
            <InputLabel>Department *</InputLabel>

            <Select
              value={form.departmentId}
              label="Department *"
              disabled={loadingDepartments || departments.length === 0}
              onChange={(event) =>
                handleChange("departmentId", event.target.value)
              }
            >
              {departments.map((department, index) => (
                <MenuItem
                  key={getDepartmentId(department) ?? index}
                  value={getDepartmentId(department)}
                >
                  {getDepartmentName(department)}
                </MenuItem>
              ))}
            </Select>

            {errors.departmentId && (
              <Typography color="error" fontSize={12} mt={0.5}>
                {errors.departmentId}
              </Typography>
            )}

            {loadingDepartments && (
              <Typography color="text.secondary" fontSize={11} mt={0.5}>
                Loading departments...
              </Typography>
            )}

            {!loadingDepartments && departments.length === 0 && (
              <Typography color="error" fontSize={11} mt={0.5}>
                No departments available. Contact your support administrator.
              </Typography>
            )}
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>

            <Select
              value={form.priority}
              label="Priority"
              onChange={(event) =>
                handleChange("priority", event.target.value)
              }
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          <Alert severity="info" sx={{ borderRadius: 3 }}>
            Choose the priority that best describes the impact of your issue.
            Your support team may review and adjust it.
          </Alert>

          <Stack
            direction={{ xs: "column-reverse", sm: "row" }}
            justifyContent="flex-end"
            gap={1.5}
            pt={1}
          >
            <Button
              variant="outlined"
              onClick={() => navigate("/customer/tickets")}
              disabled={submitting}
              sx={{ borderRadius: 3 }}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="contained"
              startIcon={
                submitting
                  ? <CircularProgress size={17} color="inherit" />
                  : <SendRounded />
              }
              disabled={
                submitting ||
                loadingDepartments ||
                departments.length === 0
              }
              sx={{ borderRadius: 3, minWidth: 160 }}
            >
              {submitting ? "Submitting..." : "Submit request"}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
