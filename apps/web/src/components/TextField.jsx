import { useId } from 'react';

// A labelled input. An `error` marks it invalid and is linked to it,
// so screen readers announce the message with the field.
export default function TextField({ label, error, className = '', ...inputProps }) {
  const errorId = useId();
  const classes = ['field', className].filter(Boolean).join(' ');
  return (
    <label className={classes}>
      {label}
      <input aria-invalid={error ? true : undefined} aria-describedby={error ? errorId : undefined} {...inputProps} />
      {error && (
        <span id={errorId} className="field-error">
          {error}
        </span>
      )}
    </label>
  );
}
