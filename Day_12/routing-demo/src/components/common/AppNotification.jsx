import { Alert } from "react-bootstrap";

function AppNotification({
  message,
  variant,
  setMessage,
}) {
  if (!message) return null;

  return (
    <Alert
      variant={variant}
      dismissible
      onClose={() =>
        setMessage("")
      }
      className="shadow-sm"
    >
      {message}
    </Alert>
  );
}

export default AppNotification;