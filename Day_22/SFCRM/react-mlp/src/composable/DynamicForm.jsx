
import "./DynamicForm.css";

function FieldRenderer({
  field,
  value,
  error,
  onChange
}) {
  if (field.hidden) return null;

  const fieldId = `field-${field.name}`;

  const commonProps = {
    id: fieldId,
    name: field.name,
    value: value ?? "",
    disabled: field.disabled,
    required: field.required,
    placeholder: field.placeholder || "",
    onChange: (event) =>
      onChange(field.name, event.target.value)
  };

  return (
    <div
      className={`dynamic-field ${
        field.fullWidth ? "full-width" : ""
      }`}
    >
      {field.type === "checkbox" ? (
        <label
          className="dynamic-checkbox"
          htmlFor={fieldId}
        >
          <input
            id={fieldId}
            name={field.name}
            type="checkbox"
            checked={Boolean(value)}
            disabled={field.disabled}
            required={field.required}
            onChange={(event) =>
              onChange(field.name, event.target.checked)
            }
          />
          <span>{field.checkboxLabel || field.label}</span>
        </label>
      ) : (
        <>
          <label htmlFor={fieldId}>
            {field.label}
            {field.required && (
              <span className="dynamic-required"> *</span>
            )}
          </label>

          {field.type === "textarea" ? (
            <textarea
              {...commonProps}
              rows={field.rows || 4}
              maxLength={field.maxLength}
            />
          ) : field.type === "select" ? (
            <select {...commonProps}>
              <option value="">
                {field.placeholder || `Select ${field.label}`}
              </option>

              {(field.options || []).map((option) => {
                const item =
                  typeof option === "string"
                    ? { label: option, value: option }
                    : option;

                return (
                  <option
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled}
                  >
                    {item.label}
                  </option>
                );
              })}
            </select>
          ) : (
            <input
              {...commonProps}
              type={field.type || "text"}
              min={field.min}
              max={field.max}
              step={field.step}
              maxLength={field.maxLength}
              readOnly={field.readOnly}
            />
          )}
        </>
      )}

      {field.helperText && (
        <small className="dynamic-helper">
          {field.helperText}
        </small>
      )}

      {error && (
        <small className="dynamic-error">
          {error}
        </small>
      )}
    </div>
  );
}

export default function DynamicForm({
  title,
  subtitle,
  sections = [],
  values = {},
  errors = {},
  error = "",
  success = "",
  saving = false,
  submitLabel = "Save",
  onChange,
  onSubmit,
  onCancel,
  children
}) {
  return (
    <section className="dynamic-form-page">
      <header className="dynamic-form-header">
        <div>
          <span className="dynamic-eyebrow">
            CLOUDBRIDGE CRM
          </span>

          <h1>{title}</h1>

          {subtitle && <p>{subtitle}</p>}
        </div>
      </header>

      <form
        className="dynamic-form"
        onSubmit={onSubmit}
        noValidate
      >
        {sections.map((section) => {
          const visibleFields = section.fields.filter(
            (field) => !field.hidden
          );

          if (!visibleFields.length) return null;

          return (
            <section
              className="dynamic-form-section"
              key={section.id || section.title}
            >
              <div className="dynamic-section-heading">
                {section.icon && (
                  <div className="dynamic-section-icon">
                    <section.icon size={19} />
                  </div>
                )}

                <div>
                  <h2>{section.title}</h2>
                  {section.description && (
                    <p>{section.description}</p>
                  )}
                </div>
              </div>

              <div className="dynamic-form-grid">
                {visibleFields.map((field) => (
                  <FieldRenderer
                    key={field.name}
                    field={field}
                    value={values[field.name]}
                    error={errors[field.name]}
                    onChange={onChange}
                  />
                ))}
              </div>
            </section>
          );
        })}

        {children}

        {error && (
          <div className="dynamic-alert dynamic-alert-error">
            {error}
          </div>
        )}

        {success && (
          <div className="dynamic-alert dynamic-alert-success">
            {success}
          </div>
        )}

        <footer className="dynamic-form-actions">
          <button
            type="button"
            className="dynamic-cancel-btn"
            onClick={onCancel}
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="dynamic-submit-btn"
            disabled={saving}
          >
            {saving ? "Saving..." : submitLabel}
          </button>
        </footer>
      </form>
    </section>
  );
}
