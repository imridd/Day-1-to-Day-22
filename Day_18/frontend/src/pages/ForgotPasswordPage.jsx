
import { useState } from "react";

import {
  Box,
  Typography,
  Stack,
  Alert,
  InputAdornment,
  Link as MuiLink
} from "@mui/material";

import {
  EmailOutlined,
  LockResetRounded
} from "@mui/icons-material";

import { Link } from "react-router-dom";

import AppInput from "../components/common/AppInput";
import AppButton from "../components/common/AppButton";

import { validateEmail } from "../utils/validation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Enter a valid email address");
      return;
    }

    setError("");

    // Connect this to the verified password-reset endpoint later.
    setMessage(
      "Email validated. Password reset API integration is pending."
    );
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={900} mb={1}>
        Forgot password?
      </Typography>

      <Typography color="text.secondary" mb={3}>
        Enter your registered email address to request a password reset.
      </Typography>

      {message && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Stack spacing={2.5}>
          <AppInput
            label="Email address"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError("");
              setMessage("");
            }}
            placeholder="you@example.com"
            error={Boolean(error)}
            helperText={error}
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

          <AppButton
            type="submit"
            fullWidth
            startIcon={<LockResetRounded />}
          >
            Request Reset
          </AppButton>
        </Stack>
      </Box>

      <Typography textAlign="center" mt={3} fontSize={13}>
        <MuiLink component={Link} to="/login" underline="hover">
          Back to login
        </MuiLink>
      </Typography>
    </Box>
  );
}
