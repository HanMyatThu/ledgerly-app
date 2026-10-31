// Amounts are stored as integer cents to avoid floating point drift.

export function toCents(value) {
  const number = typeof value === 'string' ? Number(value.trim()) : value;
  if (!Number.isFinite(number)) return NaN;
  return Math.round(number * 100);
}

export function fromCents(cents) {
  return cents / 100;
}

export function formatMoney(cents, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(fromCents(cents));
}
