export default function TextField({ label, error, className = '', ...inputProps }) {
  const classes = ['field', className].filter(Boolean).join(' ');
  return (
    <label className={classes}>
      {label}
      <input aria-invalid={error ? true : undefined} {...inputProps} />
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
