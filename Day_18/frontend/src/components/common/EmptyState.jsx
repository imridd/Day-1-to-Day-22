
import {
  Box,
  Typography,
  Button
} from "@mui/material";

import { InboxOutlined, AutoAwesome } from "@mui/icons-material";

export default function EmptyState({
  title = "Nothing here yet",
  description = "Your content will appear here when available.",
  actionLabel,
  onAction,
  icon
}) {
  return (
    <Box
      sx={{
        minHeight: 250,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
        gap: 1.5
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "24px",
          display: "grid",
          placeItems: "center",
          color: "primary.main",
          backgroundColor: "action.hover"
        }}
      >
        {icon || <InboxOutlined sx={{ fontSize: 38 }} />}
      </Box>

      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        maxWidth={330}
      >
        {description}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          startIcon={<AutoAwesome />}
          sx={{ mt: 1 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
