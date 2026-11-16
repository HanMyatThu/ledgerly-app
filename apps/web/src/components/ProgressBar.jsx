// A horizontal bar filled to `value` out of `max`. Values past max fill the bar.
export default function ProgressBar({ value, max, label, tone = 'normal' }) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div
      className={`progress progress-${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.min(value, max)}
    >
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
