
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Stack,
  Divider
} from "@mui/material";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";

import NotificationList from "./NotificationList";

export default function NotificationDrawer({
  open,
  onClose,
  notifications = [],
  onRead,
  onReadAll,
  onDelete,
  loading = false
}) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420 },
          maxWidth: "100%",
          backgroundColor: "background.paper"
        }
      }}
    >
      <Box p={2.5}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Box
              sx={{
                width: 42,
                height: 42,
                display: "grid",
                placeItems: "center",
                borderRadius: "13px",
                backgroundColor: "action.hover",
                color: "primary.main"
              }}
            >
              <NotificationsActiveOutlinedIcon />
            </Box>

            <Box>
              <Typography variant="h6" fontWeight={900}>
                Notifications
              </Typography>

              <Typography variant="caption" color="text.secondary">
                Stay in the loop.
              </Typography>
            </Box>
          </Stack>

          <IconButton onClick={onClose} aria-label="Close notifications">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <NotificationList
          notifications={notifications}
          onRead={onRead}
          onReadAll={onReadAll}
          onDelete={onDelete}
          loading={loading}
        />
      </Box>
    </Drawer>
  );
}
