import { formatMoney } from '@ledgerly/shared';

// Renders money with an optional sign and a color for income or expense.
// Without a type, negative values are shown as expenses.
export default function Amount({ cents, type, signed = false, className = '' }) {
  const tone = type ?? (cents < 0 ? 'expense' : '');
  const sign = signed ? (tone === 'expense' ? '−' : '+') : '';
  const value = signed ? Math.abs(cents) : cents;
  const classes = ['amount', tone, className].filter(Boolean).join(' ');
  return (
    <span className={classes}>
      {sign}
      {formatMoney(value)}
    </span>
  );
}
