
"use client";

import { useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  AutoAwesomeRounded,
  SupportAgentRounded,
} from "@mui/icons-material";

import { api, saveSession } from "../lib/api";

export default function LoginPage() {
  const [register, setRegister] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();

    if (busy) return;

    setError("");

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !password) {
      setError("Please enter your email and password.");
      return;
    }

    if (register && !cleanName) {
      setError("Please enter your full name.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setBusy(true);

    try {
      const endpoint = register
        ? "/auth/register"
        : "/auth/login";

      const body = register
        ? {
            name: cleanName,
            email: cleanEmail,
            password,
          }
        : {
            email: cleanEmail,
            password,
          };

      const data = await api(endpoint, {
        method: "POST",
        body,
        token: null,
      });

      if (register) {
        setRegister(false);
        setPassword("");
        setName("");

        setError(
          "Account created successfully. Please sign in."
        );

        return;
      }

      if (!data?.token || !data?.user) {
        throw new Error(
          "Invalid login response from server."
        );
      }

      saveSession(data);

      location.replace("/dashboard");

    } catch (e) {
      setError(
        e.message || "Something went wrong. Please try again."
      );
    } finally {
      setBusy(false);
    }
  }

  function toggleRegister() {
    setRegister(current => !current);

    setError("");
    setPassword("");
    setName("");
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: "1.05fr .95fr",
        },
        background:
          "linear-gradient(135deg,#17142e,#33256e 55%,#7158f5)",
        color: "#fff",
      }}
    >
      {/* LEFT BRAND SECTION */}

      <Box
        sx={{
          p: { xs: 4, md: 9 },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: { xs: 300, md: "100vh" },
        }}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <Box
              sx={{
                p: 1,
                bgcolor: "#fff2",
                borderRadius: 3,
              }}
            >
              <SupportAgentRounded />
            </Box>

            <Typography fontWeight={900} fontSize={22}>
              helpdesk
              <span style={{ color: "#ff9fc1" }}>.</span>
            </Typography>
          </Stack>

          <Chip
            icon={<AutoAwesomeRounded />}
            label="SUPPORT, IN SYNC"
            sx={{
              mt: { xs: 4, md: 10 },
              bgcolor: "#ffffff1a",
              color: "#fff",
              fontWeight: 800,
            }}
          />

          <Typography
            variant="h2"
            sx={{
              fontWeight: 950,
              letterSpacing: "-.06em",
              lineHeight: 1.02,
              mt: 3,
              fontSize: {
                xs: 40,
                sm: 52,
                md: 68,
              },
            }}
          >
            Every ticket.
            <br />
            One clear
            <br />
            <span style={{ color: "#ff9fc1" }}>
              conversation.
            </span>
          </Typography>

          <Typography
            sx={{
              mt: 3,
              maxWidth: 460,
              color: "#ded9ff",
              fontSize: 17,
              lineHeight: 1.7,
            }}
          >
            A calmer way to keep customers, agents and
            managers moving in the same direction.
          </Typography>
        </Box>

        <Typography
          color="#c7c0f4"
          variant="caption"
          sx={{ mt: 5 }}
        >
          HELPDESK WORKSPACE · 2026
        </Typography>
      </Box>

      {/* RIGHT LOGIN SECTION */}

      <Box
        sx={{
          bgcolor: "background.default",
          color: "text.primary",
          borderRadius: {
            md: "32px 0 0 32px",
          },
          display: "grid",
          placeItems: "center",
          p: 3,
        }}
      >
        <Card
          sx={{
            width: "100%",
            maxWidth: 440,
            borderRadius: 5,
            boxShadow: 8,
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 3,
                sm: 5,
              },
            }}
          >
            <Typography
              color="primary"
              fontWeight={850}
              letterSpacing={2}
              fontSize={11}
            >
              {register
                ? "CREATE YOUR ACCOUNT"
                : "WELCOME BACK"}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                mt: 1,
                fontWeight: 850,
              }}
            >
              {register
                ? "Join the workspace"
                : "Let's get things done."}
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                mt: 1,
                mb: 3,
              }}
            >
              {register
                ? "Create a customer account to raise and track tickets."
                : "Sign in to pick up where your team left off."}
            </Typography>

            {/* ERROR / SUCCESS MESSAGE */}

            {error && (
              <Alert
                severity={
                  error.includes("Account created")
                    ? "success"
                    : "error"
                }
                sx={{ mb: 2 }}
              >
                {error}
              </Alert>
            )}

            {/* LOGIN / REGISTER FORM */}

            <Box
              component="form"
              onSubmit={submit}
            >
              <Stack spacing={2}>
                {register && (
                  <TextField
                    label="Full name"
                    value={name}
                    onChange={e =>
                      setName(e.target.value)
                    }
                    required
                    fullWidth
                    autoComplete="name"
                  />
                )}

                <TextField
                  label="Email address"
                  type="email"
                  value={email}
                  onChange={e =>
                    setEmail(e.target.value)
                  }
                  required
                  fullWidth
                  autoComplete="email"
                />

                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={e =>
                    setPassword(e.target.value)
                  }
                  required
                  fullWidth
                  autoComplete={
                    register
                      ? "new-password"
                      : "current-password"
                  }
                  inputProps={{
                    minLength: 8,
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={busy}
                  fullWidth
                  sx={{
                    py: 1.4,
                    borderRadius: 3,
                    fontWeight: 850,
                    textTransform: "none",
                    fontSize: 15,
                  }}
                >
                  {busy
                    ? "Please wait..."
                    : register
                      ? "Create account"
                      : "Sign in"}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }} />

            <Button
              fullWidth
              onClick={toggleRegister}
              disabled={busy}
              sx={{
                textTransform: "none",
                fontWeight: 750,
              }}
            >
              {register
                ? "Already registered? Sign in"
                : "New customer? Create an account"}
            </Button>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
