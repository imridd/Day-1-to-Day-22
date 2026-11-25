
import { useSelector } from "react-redux";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import {
  AccountCircle,
  Email,
  Badge,
  Business,
  Shield,
} from "@mui/icons-material";

export default function ManagerProfilePage() {
  const user = useSelector((state) => state.auth.user);

  if (!user) {
    return (
      <Box p={3}>
        <Typography>No manager profile found. Please log in again.</Typography>
      </Box>
    );
  }

  const name =
    user.fullName || user.name || user.username || "Manager";

  const email = user.email || "Not available";
  const role = user.role || "Manager";
  const department =
    user.departmentName || user.department?.name || "Not assigned";
  const id = user.id || user.userId || user.agentId || "Not available";

  const details = [
    { label: "Full Name", value: name, icon: <AccountCircle /> },
    { label: "Email Address", value: email, icon: <Email /> },
    { label: "User ID", value: id, icon: <Badge /> },
    { label: "Department", value: department, icon: <Business /> },
  ];

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" fontWeight={800} mb={1}>
        My Profile
      </Typography>

      <Typography color="text.secondary" mb={3}>
        View your manager account information.
      </Typography>

      <Card
        sx={{
          maxWidth: 850,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            p: 4,
            background:
              "linear-gradient(120deg, #6C63FF 0%, #A855F7 55%, #EC4899 100%)",
            color: "#fff",
          }}
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <Avatar
              sx={{
                width: 90,
                height: 90,
                bgcolor: "rgba(255,255,255,0.2)",
                color: "#fff",
                fontSize: 36,
                fontWeight: 800,
              }}
            >
              {name.charAt(0).toUpperCase()}
            </Avatar>

            <Box textAlign={{ xs: "center", sm: "left" }}>
              <Typography variant="h5" fontWeight={800}>
                {name}
              </Typography>
              <Typography sx={{ opacity: 0.9 }}>
                {email}
              </Typography>
              <Chip
                icon={<Shield />}
                label={role}
                sx={{
                  mt: 1.5,
                  color: "#fff",
                  bgcolor: "rgba(255,255,255,0.2)",
                  fontWeight: 700,
                }}
              />
            </Box>
          </Stack>
        </Box>

        <CardContent sx={{ p: { xs: 2, md: 4 } }}>
          <Typography variant="h6" fontWeight={800} mb={3}>
            Account Information
          </Typography>

          <Grid container spacing={2}>
            {details.map((item) => (
              <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    p: 2.5,
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 3,
                    height: "100%",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box color="primary.main">{item.icon}</Box>
                    <Box minWidth={0}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {item.label}
                      </Typography>
                      <Typography fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                        {item.value}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary">
            Profile details are currently read-only. Editing requires a
            profile update API from the backend.
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
