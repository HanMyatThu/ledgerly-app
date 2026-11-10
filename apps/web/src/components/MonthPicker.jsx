import { currentMonth, formatMonth, shiftMonth } from '../lib/month.js';

export default function MonthPicker({ value, onChange }) {
  const isCurrent = value === currentMonth();
  return (
    <div className="month-picker">
      <button type="button" aria-label="Previous month" onClick={() => onChange(shiftMonth(value, -1))}>
        ‹
      </button>
      <h2 aria-live="polite">{formatMonth(value)}</h2>
      <button type="button" aria-label="Next month" onClick={() => onChange(shiftMonth(value, 1))}>
        ›
      </button>
      {!isCurrent && (
        <button type="button" className="month-picker-today" onClick={() => onChange(currentMonth())}>
          This month
        </button>
      )}
    </div>
  );
}
