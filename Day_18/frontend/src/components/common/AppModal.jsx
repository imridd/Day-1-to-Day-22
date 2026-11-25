
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box
} from "@mui/material";

import { Close } from "@mui/icons-material";

export default function AppModal({
  open,
  onClose,
  title,
  subtitle,
  children,
  actions,
  maxWidth = "sm",
  fullWidth = true
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={maxWidth}
      PaperProps={{
        sx: {
          borderRadius: "22px",
          backgroundImage: "none",
          border: "1px solid",
          borderColor: "divider"
        }
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          px: 3,
          pt: 3
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {title}
          </Typography>

          {subtitle && (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              {subtitle}
            </Typography>
          )}
        </Box>

        <IconButton
          onClick={onClose}
          aria-label="Close dialog"
          size="small"
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
