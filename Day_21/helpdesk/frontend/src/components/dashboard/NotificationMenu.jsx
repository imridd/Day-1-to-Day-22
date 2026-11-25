
'use client';

import {
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Badge,
  Button
} from '@mui/material';

import NotificationsNoneRounded from '@mui/icons-material/NotificationsNoneRounded';

export default function NotificationMenu({
  anchorEl,
  open,
  onClose,
  notifications = [],
  onNotificationClick,
  onMarkAllRead
}) {
  const unreadCount = notifications.filter(
    (item) => !Boolean(item.is_read)
  ).length;

  return (
    <Menu
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 340,
          maxWidth: '90vw',
          maxHeight: 430,
          borderRadius: 3,
          mt: 1
        }
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        px={2}
        py={1.5}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <NotificationsNoneRounded color="primary" />
          <Typography fontWeight={800}>
            Notifications
          </Typography>
          <Badge badgeContent={unreadCount} color="error" />
        </Box>

        {unreadCount > 0 && (
          <Button size="small" onClick={onMarkAllRead}>
            Mark all read
          </Button>
        )}
      </Box>

      <Divider />

      {notifications.length === 0 ? (
        <Box p={3} textAlign="center">
          <Typography color="text.secondary">
            You're all caught up! 🎉
          </Typography>
        </Box>
      ) : (
        notifications.map((notification) => {
          const isRead = Boolean(notification.is_read);

          return (
            <MenuItem
              key={notification.id}
              onClick={() => onNotificationClick(notification)}
              sx={{
                py: 1.5,
                px: 2,
                whiteSpace: 'normal',
                alignItems: 'flex-start',
                backgroundColor: isRead
                  ? 'transparent'
                  : 'action.hover'
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography
                  fontWeight={isRead ? 500 : 800}
                  fontSize={13}
                >
                  {notification.title || 'Notification'}
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 0.5 }}
                >
                  {notification.body || notification.message || ''}
                </Typography>
              </Box>
            </MenuItem>
          );
        })
      )}
    </Menu>
  );
}
