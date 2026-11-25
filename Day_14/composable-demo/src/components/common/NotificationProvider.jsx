
import {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

import { Toast, ToastContainer } from "react-bootstrap";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((message, variant = "success") => {
    const id = Date.now() + Math.random();

    setNotifications((prev) => [
      ...prev,
      { id, message, variant },
    ]);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      <ToastContainer
        position="top-end"
        className="p-3"
        style={{ zIndex: 9999 }}
      >
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            bg={notification.variant}
            onClose={() => removeNotification(notification.id)}
            delay={3500}
            autohide
          >
            <Toast.Header>
              <strong className="me-auto">
                {notification.variant === "success"
                  ? "✨ Success"
                  : notification.variant === "danger"
                  ? "⚠️ Error"
                  : notification.variant === "warning"
                  ? "⚡ Warning"
                  : "💡 Info"}
              </strong>
            </Toast.Header>

            <Toast.Body className="text-white">
              {notification.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error(
      "useNotification must be used inside NotificationProvider"
    );
  }

  return context;
}
