
import { useEffect } from "react";
import {
  X,
  Pencil,
  Eye,
  CalendarDays,
  UserRound,
  Clock3
} from "lucide-react";

import "./RecordDrawer.css";

export default function RecordDrawer({
  open = false,
  mode = "view",
  title = "Record details",
  subtitle = "",
  record = {},
  fields = [],
  loading = false,
  onClose,
  onEdit,
  footer
}) {
  useEffect(() => {
    if (!open) return;

    function handleEscape(event) {
      if (event.key === "Escape") {
        onClose?.();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!open) return null;

  function formatValue(field, value) {
    if (field.render) {
      return field.render(value, record);
    }

    if (value === null || value === undefined || value === "") {
      return "Not provided";
    }

    if (field.type === "date" || field.type === "datetime") {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) return String(value);

      return field.type === "date"
        ? date.toLocaleDateString("en-IN")
        : date.toLocaleString("en-IN");
    }

    if (field.type === "currency") {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: field.currency || "INR",
        maximumFractionDigits: 0
      }).format(Number(value));
    }

    if (field.type === "boolean") {
      return value ? "Yes" : "No";
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    return String(value);
  }

  return (
    <div
      className="record-drawer-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <aside
        className="record-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="record-drawer-header">
          <div className="record-drawer-heading">
            <div className="record-drawer-icon">
              {mode === "edit"
                ? <Pencil size={18} />
                : <Eye size={18} />}
            </div>

            <div>
              <h2>{title}</h2>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>

          <button
            type="button"
            className="record-drawer-close"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X size={19} />
          </button>
        </header>

        {loading ? (
          <div className="record-drawer-loading">
            <Clock3 size={24} />
            <span>Loading record...</span>
          </div>
        ) : (
          <>
            <div className="record-drawer-content">
              {fields.map((section, index) => {
                const sectionFields = Array.isArray(section.fields)
                  ? section.fields
                  : [section];

                return (
                  <section
                    className="record-drawer-section"
                    key={section.id || section.title || index}
                  >
                    {section.title && (
                      <h3>{section.title}</h3>
                    )}

                    <div className="record-drawer-grid">
                      {sectionFields.map((field) => {
                        if (field.hidden) return null;

                        const value = field.accessor
                          ? typeof field.accessor === "function"
                            ? field.accessor(record)
                            : field.accessor
                                .split(".")
                                .reduce(
                                  (result, key) => result?.[key],
                                  record
                                )
                          : record[field.name];

                        return (
                          <div
                            className={`record-drawer-field ${
                              field.fullWidth ? "full-width" : ""
                            }`}
                            key={field.name}
                          >
                            <span className="record-drawer-label">
                              {field.label}
                            </span>

                            <div className="record-drawer-value">
                              {formatValue(field, value)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                );
              })}
            </div>

            <footer className="record-drawer-footer">
              {footer || (
                <>
                  <button
                    type="button"
                    className="record-drawer-secondary"
                    onClick={onClose}
                  >
                    Close
                  </button>

                  {mode === "view" && onEdit && (
                    <button
                      type="button"
                      className="record-drawer-primary"
                      onClick={() => onEdit(record)}
                    >
                      <Pencil size={15} />
                      Edit record
                    </button>
                  )}
                </>
              )}
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
