
import { useState } from "react";

import {
  Box,
  Typography,
  Stack,
  InputAdornment,
  IconButton,
  Alert,
  Link as MuiLink,
} from "@mui/material";

import {
  EmailOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
  LoginRounded,
  SupportAgentRounded,
} from "@mui/icons-material";

import { Link, useNavigate } from "react-router-dom";

import AppInput from "../components/common/AppInput";
import AppButton from "../components/common/AppButton";

import useAuth from "../hooks/useAuth";
import { validateLogin } from "../utils/validation";

function getDashboard(role) {
  const normalized = String(role || "").toLowerCase();

  if (normalized === "manager" || normalized === "admin") {
    return "/manager/dashboard";
  }

  if (normalized === "agent") {
    return "/agent/dashboard";
  }

  if (normalized === "customer" || normalized === "user") {
    return "/customer/dashboard";
  }

  return null;
}

export default function LoginPage() {
  const navigate = useNavigate();

  const { login, loading, error, clearError } = useAuth();

  const [showPassword, setShowPassword] = useState(false);

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    clearError();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const result = await login({
        email: values.email.trim(),
        password: values.password,
      });

      if (result?.error) {
        return;
      }

      const user =
        result?.payload?.user ||
        result?.payload?.data?.user ||
        result?.payload?.data ||
        null;

      const dashboard = getDashboard(
        user?.role || user?.userRole || user?.user_type
      );

      if (!dashboard) {
        throw new Error("Your account role is not recognized.");
      }

      navigate(dashboard, { replace: true });
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <Box>
      {/* Header */}
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          mb: 3,
        }}
      >
        <SupportAgentRounded color="primary" fontSize="large" />

        <Typography fontWeight={900} variant="h5">
          Welcome back
        </Typography>
      </Stack>

      <Typography
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Sign in to continue to your Helpdesk workspace.
      </Typography>

      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {typeof error === "string"
            ? error
            : "Login failed. Please try again."}
        </Alert>
      )}

      {/* Login form */}
      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          {/* Email */}
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
                ),
              },
            }}
          />

          {/* Password */}
          <Box>
            <AppInput
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={handleChange}
              placeholder="Enter your password"
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
                        onClick={() =>
                          setShowPassword((current) => !current)
                        }
                        edge="end"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? (
                          <VisibilityOff />
                        ) : (
                          <Visibility />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box
              sx={{
                textAlign: "right",
                mt: 1,
              }}
            >
              <MuiLink
                component={Link}
                to="/forgot-password"
                underline="hover"
                sx={{ fontSize: 13 }}
              >
                Forgot password?
              </MuiLink>
            </Box>
          </Box>

          {/* Submit */}
          <AppButton
            type="submit"
            loading={loading}
            fullWidth
            startIcon={<LoginRounded />}
          >
            Sign In
          </AppButton>
        </Stack>
      </Box>

      {/* Registration link */}
      <Typography
        color="text.secondary"
        sx={{
          textAlign: "center",
          fontSize: 13,
          mt: 3,
        }}
      >
        Don't have an account?{" "}
        <MuiLink
          component={Link}
          to="/register"
          fontWeight={700}
        >
          Create account
        </MuiLink>
      </Typography>
    </Box>
  );
}
