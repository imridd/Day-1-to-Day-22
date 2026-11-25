
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  Info,
  X
} from "lucide-react";

import "./ConfirmDialog.css";

const VARIANTS = {
  danger: {
    icon: Trash2,
    iconClass: "confirm-icon-danger",
    buttonClass: "confirm-button-danger",
    defaultTitle: "Delete this record?",
    defaultDescription:
      "This action may permanently remove this record. You cannot undo it."
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "confirm-icon-warning",
    buttonClass: "confirm-button-warning",
    defaultTitle: "Are you sure?",
    defaultDescription:
      "Please review this action before continuing."
  },
  success: {
    icon: CheckCircle2,
    iconClass: "confirm-icon-success",
    buttonClass: "confirm-button-success",
    defaultTitle: "Confirm action",
    defaultDescription:
      "Are you ready to continue?"
  },
  info: {
    icon: Info,
    iconClass: "confirm-icon-info",
    buttonClass: "confirm-button-info",
    defaultTitle: "Please confirm",
    defaultDescription:
      "Do you want to proceed with this action?"
  }
};

export default function ConfirmDialog({
  open = false,
  variant = "danger",
  title,
  description,
  recordName,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel
}) {
  if (!open) return null;

  const config = VARIANTS[variant] || VARIANTS.danger;
  const Icon = config.icon;

  return (
    <div
      className="confirm-dialog-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel?.();
        }
      }}
    >
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <button
          type="button"
          className="confirm-dialog-close"
          onClick={onCancel}
          disabled={loading}
          aria-label="Close confirmation"
        >
          <X size={18} />
        </button>

        <div className={`confirm-dialog-icon ${config.iconClass}`}>
          <Icon size={25} />
        </div>

        <h2 id="confirm-dialog-title">
          {title || config.defaultTitle}
        </h2>

        <p id="confirm-dialog-description">
          {description || config.defaultDescription}
        </p>

        {recordName && (
          <div className="confirm-record-name">
            <span>Selected record</span>
            <strong>{recordName}</strong>
          </div>
        )}

        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="confirm-button-cancel"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            className={`confirm-button ${config.buttonClass}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
