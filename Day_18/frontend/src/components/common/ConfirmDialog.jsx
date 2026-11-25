
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button
} from "@mui/material";

import { WarningAmberRounded } from "@mui/icons-material";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  loading = false,
  destructive = false
}) {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "22px",
          p: 1
        }
      }}
    >
      <DialogTitle>
        <WarningAmberRounded
          sx={{
            color: destructive ? "error.main" : "warning.main",
            fontSize: 35,
            mb: 1
          }}
        />

        <Typography variant="h6" fontWeight={700}>
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent>
        <Typography color="text.secondary">
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={loading}
        >
          {cancelText}
        </Button>

        <Button
          variant="contained"
          color={destructive ? "error" : "primary"}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? "Please wait..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
