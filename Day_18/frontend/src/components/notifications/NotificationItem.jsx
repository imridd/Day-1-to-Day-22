
import {
  Box,
  Typography,
  Stack,
  Avatar,
  IconButton,
  Tooltip
} from "@mui/material";

import {
  ConfirmationNumber,
  PersonOutline,
  NotificationsActive,
  CheckCircleOutline,
  DeleteOutline
} from "@mui/icons-material";

export default function NotificationItem({
  notification,
  onRead,
  onDelete
}) {
  const id = notification.notificationId ?? notification.id;

  const isRead =
    Boolean(notification.isRead ?? notification.is_read ?? notification.readAt);

  const title =
    notification.title || "New notification";

  const message =
    notification.message ||
    notification.description ||
    notification.content ||
    "";

  const type = String(notification.type || "").toLowerCase();

  const getIcon = () => {
    if (type.includes("ticket")) return <ConfirmationNumber />;
    if (type.includes("assign")) return <PersonOutline />;
    return <NotificationsActive />;
  };

  const createdAt =
    notification.createdAt || notification.created_at;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        p: 2,
        borderRadius: "14px",
        backgroundColor: isRead ? "transparent" : "action.hover",
        transition: "background 0.2s",
        "&:hover": {
          backgroundColor: "action.selected"
        }
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          backgroundColor: "primary.main"
        }}
      >
        {getIcon()}
      </Avatar>

      <Box flex={1} minWidth={0}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <Typography fontWeight={isRead ? 500 : 800} fontSize={13}>
            {title}
          </Typography>

          {!isRead && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                mt: 0.6,
                flexShrink: 0
              }}
            />
          )}
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mt: 0.5, overflowWrap: "anywhere" }}
        >
          {message}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={1}
        >
          {createdAt
            ? new Date(createdAt).toLocaleString()
            : "Recently"}
        </Typography>
      </Box>

      <Stack>
        {!isRead && (
          <Tooltip title="Mark as read">
            <IconButton
              size="small"
              onClick={() => onRead?.(id)}
            >
              <CheckCircleOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {onDelete && (
          <Tooltip title="Delete notification">
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(id)}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Stack>
    </Box>
  );
}
