
import { Button, CircularProgress } from "@mui/material";

export default function AppButton({
  children,
  loading = false,
  startIcon,
  endIcon,
  variant = "contained",
  color = "primary",
  size = "medium",
  disabled = false,
  fullWidth = false,
  onClick,
  type = "button",
  sx = {},
  ...props
}) {
  return (
    <Button
      type={type}
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      startIcon={
        loading ? (
          <CircularProgress size={17} color="inherit" />
        ) : startIcon
      }
      endIcon={loading ? null : endIcon}
      sx={{
        minHeight: 42,
        fontWeight: 700,
        letterSpacing: "0.1px",
        transition: "all 200ms ease",
        "&:hover": {
          transform: "translateY(-2px)"
        },
        "&:active": {
          transform: "scale(0.98)"
        },
        ...sx
      }}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </Button>
  );
}
