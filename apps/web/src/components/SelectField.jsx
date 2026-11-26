import { useId } from 'react';

// A labelled select. Errors are linked to it the same way as TextField.
export default function SelectField({ label, options, error, className = '', ...selectProps }) {
  const errorId = useId();
  const classes = ['field', className].filter(Boolean).join(' ');
  return (
    <label className={classes}>
      {label}
      <select aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span id={errorId} className="field-error">
          {error}
        </span>
      )}
    </label>
  );
}
