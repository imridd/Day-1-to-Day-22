
import {
  Box,
  Stack,
  Typography,
  Button,
  Divider
} from "@mui/material";

import DoneAllIcon from "@mui/icons-material/DoneAll";

import NotificationItem from "./NotificationItem";
import EmptyState from "../common/EmptyState";
import AppLoader from "../common/AppLoader";

export default function NotificationList({
  notifications = [],
  onRead,
  onReadAll,
  onDelete,
  loading = false
}) {
  const unreadCount = notifications.filter((item) => {
    return !Boolean(
      item.isRead ?? item.is_read ?? item.readAt
    );
  }).length;

  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box>
          <Typography fontWeight={800}>
            Recent activity
          </Typography>

          <Typography variant="caption" color="text.secondary">
            {unreadCount} unread notification(s)
          </Typography>
        </Box>

        {unreadCount > 0 && (
          <Button
            size="small"
            startIcon={<DoneAllIcon />}
            onClick={onReadAll}
          >
            Mark all read
          </Button>
        )}
      </Stack>

      <Divider sx={{ mb: 1 }} />

      {loading ? (
        <AppLoader message="Loading notifications..." />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="You're all caught up!"
          description="New notifications will appear here."
        />
      ) : (
        <Stack divider={<Divider flexItem />} spacing={0}>
          {notifications.map((notification, index) => (
            <NotificationItem
              key={
                notification.notificationId ??
                notification.id ??
                index
              }
              notification={notification}
              onRead={onRead}
              onDelete={onDelete}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
