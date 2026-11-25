
import { Chip } from "@mui/material";

const statusConfig = {
  open: { label: "Open", color: "info" },
  new: { label: "New", color: "info" },
  created: { label: "Created", color: "info" },
  pending: { label: "Pending", color: "warning" },
  in_progress: { label: "In Progress", color: "secondary" },
  "in progress": { label: "In Progress", color: "secondary" },
  assigned: { label: "Assigned", color: "secondary" },
  resolved: { label: "Resolved", color: "success" },
  closed: { label: "Closed", color: "default" },
  rejected: { label: "Rejected", color: "error" },
  active: { label: "Active", color: "success" },
  inactive: { label: "Inactive", color: "default" },
  high: { label: "High", color: "error" },
  medium: { label: "Medium", color: "warning" },
  low: { label: "Low", color: "success" }
};

export default function StatusChip({
  status,
  size = "small"
}) {
  const normalized = String(status || "unknown")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");

  const config = statusConfig[normalized] || {
    label: String(status || "Unknown")
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase()),
    color: "default"
  };

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{
        borderRadius: "8px",
        fontWeight: 700,
        letterSpacing: "0.2px",
        "& .MuiChip-label": {
          px: 1.2
        }
      }}
    />
  );
}
