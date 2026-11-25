
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Switch,
  Typography
} from "@mui/material";
import {
  PersonRounded,
  EmailRounded,
  BadgeRounded,
  SettingsRounded,
  DarkModeRounded,
  LightModeRounded,
  VerifiedUserRounded
} from "@mui/icons-material";
import { useSelector } from "react-redux";
import { useThemeMode } from "../../app/ThemeProvider";

export default function CustomerProfilePage() {
  const { user } = useSelector(state => state.auth);
  const { mode, toggleTheme } = useThemeMode();

  const fullName =
    user?.fullName ??
    user?.name ??
    user?.username ??
    "Customer";

  const email = user?.email ?? "Not available";

  const role = user?.role ?? "Customer";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join("");

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1050, mx: "auto" }}>
      <Box mb={3}>
        <Typography variant="h4" fontWeight={800}>
          My Profile ✨
        </Typography>
        <Typography color="text.secondary">
          Your account information and preferences.
        </Typography>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 4 },
          borderRadius: 4,
          border: 1,
          borderColor: "divider",
          background: theme =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, #20213a, #171827)"
              : "linear-gradient(135deg, #eef2ff, #ffffff)"
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2.5}
          alignItems={{ xs: "flex-start", sm: "center" }}
        >
          <Avatar
            sx={{
              width: 85,
              height: 85,
              fontSize: 30,
              fontWeight: 800,
              bgcolor: "primary.main"
            }}
          >
            {initials || "C"}
          </Avatar>

          <Box flex={1}>
            <Typography variant="h5" fontWeight={800}>
              {fullName}
            </Typography>

            <Typography color="text.secondary">
              {email}
            </Typography>

            <Stack direction="row" spacing={1} mt={1}>
              <Chip
                icon={<VerifiedUserRounded />}
                label="Account"
                color="success"
                size="small"
              />
              <Chip label={role} size="small" />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "1fr 1fr"
          },
          gap: 2,
          mt: 3
        }}
      >
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: 1,
            borderColor: "divider"
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <PersonRounded color="primary" />
            <Typography variant="h6" fontWeight={800}>
              Personal information
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Stack spacing={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PersonRounded color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Full name
                </Typography>
                <Typography fontWeight={600}>{fullName}</Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <EmailRounded color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Email address
                </Typography>
                <Typography fontWeight={600}>{email}</Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1.5} alignItems="center">
              <BadgeRounded color="action" />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Account role
                </Typography>
                <Typography fontWeight={600}>{role}</Typography>
              </Box>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: 1,
            borderColor: "divider"
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <SettingsRounded color="primary" />
            <Typography variant="h6" fontWeight={800}>
              Preferences
            </Typography>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              {mode === "dark"
                ? <DarkModeRounded color="primary" />
                : <LightModeRounded color="primary" />}

              <Box>
                <Typography fontWeight={700}>
                  Dark mode
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Change your dashboard appearance.
                </Typography>
              </Box>
            </Stack>

            <Switch
              checked={mode === "dark"}
              onChange={toggleTheme}
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="body2" color="text.secondary">
            Your theme preference is saved locally in this browser.
            It does not update your backend account.
          </Typography>
        </Paper>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          mt: 2,
          borderRadius: 4,
          border: 1,
          borderColor: "divider"
        }}
      >
        <Typography fontWeight={800} mb={1}>
          Account security
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Your account authentication is managed by the Helpdesk
          application. Password changes and profile editing will be
          added after the corresponding backend APIs are verified.
        </Typography>
      </Paper>
    </Box>
  );
}
