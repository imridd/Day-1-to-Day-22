
import { useEffect, useState } from "react";

import {
  Stack,
  MenuItem,
  Typography,
  Box
} from "@mui/material";

import {
  AutoAwesome,
  ConfirmationNumber
} from "@mui/icons-material";

import AppInput from "../common/AppInput";
import AppButton from "../common/AppButton";

const initialForm = {
  title: "",
  description: "",
  priority: "medium",
  departmentId: ""
};

export default function TicketForm({
  initialValues,
  departments = [],
  onSubmit,
  onCancel,
  loading = false,
  submitLabel
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      setForm({
        title: initialValues.title || initialValues.subject || "",
        description: initialValues.description || "",
        priority: initialValues.priority || "medium",
        departmentId: initialValues.departmentId ??
          initialValues.department_id ?? ""
      });
    } else {
      setForm(initialForm);
    }

    setErrors({});
  }, [initialValues]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value
    }));

    setErrors((current) => ({
      ...current,
      [name]: ""
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.title.trim()) {
      nextErrors.title = "Ticket title is required";
    } else if (form.title.trim().length < 5) {
      nextErrors.title = "Enter at least 5 characters";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required";
    } else if (form.description.trim().length < 10) {
      nextErrors.description = "Enter at least 10 characters";
    }

    if (!form.departmentId) {
      nextErrors.departmentId = "Select a department";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) return;

    onSubmit?.({
      title: form.title.trim(),
      description: form.description.trim(),
      priority: form.priority,
      departmentId: form.departmentId
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2.5}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 2,
            borderRadius: "15px",
            backgroundColor: "action.hover"
          }}
        >
          <ConfirmationNumber color="primary" />

          <Box>
            <Typography fontWeight={700}>
              {initialValues ? "Update your ticket" : "Create a support ticket"}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Give us the details so we can help you faster.
            </Typography>
          </Box>
        </Box>

        <AppInput
          label="Ticket title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="What do you need help with?"
          error={Boolean(errors.title)}
          helperText={errors.title}
          required
        />

        <AppInput
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your issue in detail..."
          multiline
          rows={5}
          error={Boolean(errors.description)}
          helperText={errors.description}
          required
        />

        <AppInput
          select
          label="Priority"
          name="priority"
          value={form.priority}
          onChange={handleChange}
        >
          <MenuItem value="low">Low</MenuItem>
          <MenuItem value="medium">Medium</MenuItem>
          <MenuItem value="high">High</MenuItem>
          <MenuItem value="urgent">Urgent</MenuItem>
        </AppInput>

        <AppInput
          select
          label="Department"
          name="departmentId"
          value={form.departmentId}
          onChange={handleChange}
          error={Boolean(errors.departmentId)}
          helperText={errors.departmentId}
          required
        >
          {departments.map((department) => (
            <MenuItem
              key={department.departmentId ?? department.id}
              value={department.departmentId ?? department.id}
            >
              {department.departmentName || department.name}
            </MenuItem>
          ))}
        </AppInput>

        <Stack direction="row" justifyContent="flex-end" gap={1.5}>
          {onCancel && (
            <AppButton
              variant="outlined"
              color="inherit"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </AppButton>
          )}

          <AppButton
            type="submit"
            loading={loading}
            startIcon={<AutoAwesome />}
          >
            {submitLabel || (initialValues ? "Save Changes" : "Create Ticket")}
          </AppButton>
        </Stack>
      </Stack>
    </Box>
  );
}
