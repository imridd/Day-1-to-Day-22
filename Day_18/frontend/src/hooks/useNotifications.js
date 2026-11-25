
import { useAppDispatch, useAppSelector } from "./reduxHooks";

import {
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  addNotification,
  clearNotifications
} from "../features/notifications/notificationSlice";

export default function useNotifications() {
  const dispatch = useAppDispatch();

  const notificationState = useAppSelector(
    (state) => state.notifications
  );

  const notifications = notificationState.items || [];

  const unreadCount = notifications.filter((item) => {
    return !Boolean(
      item.isRead ?? item.is_read ?? item.readAt
    );
  }).length;

  return {
    notifications,
    unreadCount,
    loading: notificationState.loading,
    error: notificationState.error,

    loadNotifications: () => dispatch(fetchNotifications()),

    markAsRead: (id) => dispatch(markNotificationRead(id)),

    markAllAsRead: () => dispatch(markAllNotificationsRead()),

    receiveNotification: (notification) =>
      dispatch(addNotification(notification)),

    clearAll: () => dispatch(clearNotifications())
  };
}
