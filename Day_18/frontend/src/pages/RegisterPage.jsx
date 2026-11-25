
import { useState } from "react";

import {
  Box,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
  Link as MuiLink
} from "@mui/material";

import {
  Person,
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  PersonAddAlt1
} from "@mui/icons-material";

import { Link } from "react-router-dom";

import AppInput from "../components/common/AppInput";
import AppButton from "../components/common/AppButton";

import { validateRegistration } from "../utils/validation";

export default function RegisterPage() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value
    }));

    setErrors((current) => ({
      ...current,
      [name]: ""
    }));

    setMessage("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateRegistration(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length) return;

    // Connect this to the verified customer-registration endpoint later.
    setMessage(
      "Validation successful. Registration API integration is pending."
    );
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={900} mb={1}>
        Create account
      </Typography>

      <Typography color="text.secondary" mb={3}>
        Get started with your support workspace.
      </Typography>

      {message && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <AppInput
            label="Full name"
            name="name"
            value={values.name}
            onChange={handleChange}
            placeholder="Your full name"
            error={Boolean(errors.name)}
            helperText={errors.name}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                )
              }
            }}
          />

          <AppInput
            label="Email address"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={Boolean(errors.email)}
            helperText={errors.email}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined />
                  </InputAdornment>
                )
              }
            }}
          />

          <AppInput
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={values.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            error={Boolean(errors.password)}
            helperText={errors.password}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((value) => !value)}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          <AppInput
            label="Confirm password"
            name="confirmPassword"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            error={Boolean(errors.confirmPassword)}
            helperText={errors.confirmPassword}
          />

          <AppButton
            type="submit"
            fullWidth
            startIcon={<PersonAddAlt1 />}
          >
            Create Account
          </AppButton>
        </Stack>
      </Box>

      <Typography
        textAlign="center"
        fontSize={13}
        color="text.secondary"
        mt={3}
      >
        Already have an account?{" "}
        <MuiLink component={Link} to="/login" fontWeight={700}>
          Sign in
        </MuiLink>
      </Typography>
    </Box>
  );
}
