export default function SelectField({ label, options, error, className = '', ...selectProps }) {
  const classes = ['field', className].filter(Boolean).join(' ');
  return (
    <label className={classes}>
      {label}
      <select aria-invalid={error ? true : undefined} {...selectProps}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="field-error">{error}</span>}
    </label>
  );
}
