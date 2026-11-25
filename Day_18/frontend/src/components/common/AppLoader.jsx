
import { Box, CircularProgress, Typography } from "@mui/material";

import { AutoAwesome } from "@mui/icons-material";

export default function AppLoader({
  message = "Getting things ready...",
  fullScreen = false,
  size = 42
}) {
  return (
    <Box
      sx={{
        minHeight: fullScreen ? "100vh" : 220,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2
      }}
    >
      <Box position="relative" display="flex">
        <CircularProgress
          size={size}
          thickness={4}
          sx={{ color: "primary.main" }}
        />

        <AutoAwesome
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 19,
            color: "secondary.main"
          }}
        />
      </Box>

      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
