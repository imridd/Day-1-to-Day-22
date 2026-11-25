
import { Box, Typography, Stack } from "@mui/material";
import { SupportAgentRounded } from "@mui/icons-material";
import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        bgcolor: "background.default",
      }}
    >
      {/* Left branding section */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          justifyContent: "center",
          p: 7,
          color: "#fff",
          background:
            "linear-gradient(145deg, #4C1D95, #7C3AED, #A855F7)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background decoration */}
        <Box
          sx={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.08)",
            top: -100,
            right: -100,
          }}
        />

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <SupportAgentRounded sx={{ fontSize: 55, mb: 3 }} />

          <Typography variant="h2" fontWeight={900} mb={2}>
            Support,
            <br />
            but make it simple.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              opacity: 0.8,
              maxWidth: 430,
              lineHeight: 1.7,
            }}
          >
            One place for tickets, conversations and better customer
            experiences.
          </Typography>

          <Typography
            variant="body2"
            sx={{ mt: 8, opacity: 0.7 }}
          >
            Helpdesk — Your support workspace.
          </Typography>
        </Box>
      </Box>

      {/* Right authentication section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 2, sm: 3, md: 5 },
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 440,
          }}
        >
          {/* Mobile branding */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              mb: 4,
            }}
          >
            <SupportAgentRounded color="primary" />

            <Typography fontWeight={900} variant="h6">
              Helpdesk
            </Typography>
          </Stack>

          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
