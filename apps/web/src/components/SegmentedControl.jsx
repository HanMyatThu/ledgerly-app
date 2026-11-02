export default function SegmentedControl({ label, options, value, onChange, className = '' }) {
  const classes = ['segmented', className].filter(Boolean).join(' ');
  return (
    <div className={classes} role="radiogroup" aria-label={label}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            className={selected ? 'active' : ''}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
