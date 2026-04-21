
import React from "react";
import "./EntityCreateForm.css";

/**
 * Generic entity creation form.
 * @param {Object} props
 * @param {Array} props.fields - Array of field configs: { label, type, value, onChange, options, multiple, placeholder, required, render }
 * @param {function} props.onSubmit - Form submit handler
 * @param {string} [props.error] - Error message
 * @param {string} [props.buttonLabel] - Submit button label
 * @param {boolean} [props.loading] - Loading state
 */
const EntityCreateForm = ({ fields, onSubmit, error, buttonLabel = "Create", loading = false }) => {
  return (
    <form className="entity-create-form" onSubmit={onSubmit} style={{ width: "100%", marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {fields.map((field, idx) => {
        if (field.render) return <React.Fragment key={idx}>{field.render()}</React.Fragment>;
        if (field.type === "select") {
          return (
            <select
              key={idx}
              value={field.value}
              onChange={field.onChange}
              required={field.required}
              multiple={field.multiple}
              style={field.style || { minWidth: 120 }}
            >
              {field.placeholder && !field.multiple && <option value="">{field.placeholder}</option>}
              {field.options && field.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          );
        }
        if (field.type === "custom") {
          return field.render ? field.render() : null;
        }
        return (
          <input
            key={idx}
            type={field.type}
            value={field.value}
            onChange={field.onChange}
            placeholder={field.placeholder}
            required={field.required}
            style={field.style}
            min={field.min}
            max={field.max}
            step={field.step}
          />
        );
      })}
      <button type="submit" style={{ marginLeft: 8 }} disabled={loading}>{buttonLabel}</button>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

export default EntityCreateForm;
