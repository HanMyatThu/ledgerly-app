// Date math for recurring transactions. Dates are YYYY-MM-DD strings and all
// math is done in UTC, so results never shift with the local time zone.

export const FREQUENCIES = ['weekly', 'monthly'];

function parse(date) {
  const [y, m, d] = date.split('-').map(Number);
  return { y, m, d };
}

function format(y, m, d) {
  return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

function daysInMonth(y, m) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

export function addDays(date, days) {
  const { y, m, d } = parse(date);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

// Moves `months` months from `date`, keeping `anchorDay` (the rule's day of month)
// and clamping it to the length of the target month: the 31st becomes Feb 28 or 29.
export function addMonths(date, months, anchorDay = parse(date).d) {
  const { y, m } = parse(date);
  const index = y * 12 + (m - 1) + months;
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return format(year, month, Math.min(anchorDay, daysInMonth(year, month)));
}

// The nth occurrence of a rule (n = 0 is the start date).
export function occurrenceAt(rule, n) {
  if (rule.frequency === 'weekly') return addDays(rule.startDate, n * 7);
  if (rule.frequency === 'monthly') return addMonths(rule.startDate, n, parse(rule.startDate).d);
  throw new Error(`Unknown frequency "${rule.frequency}"`);
}

// Every occurrence of `rule` from `from` to `to`, both inclusive, never before
// the rule's startDate or after its endDate. Capped at `limit` dates.
export function occurrencesBetween(rule, from, to, limit = 500) {
  const last = rule.endDate && rule.endDate < to ? rule.endDate : to;
  const dates = [];
  for (let n = 0; dates.length < limit; n += 1) {
    const date = occurrenceAt(rule, n);
    if (date > last) break;
    if (date >= from) dates.push(date);
  }
  return dates;
}

// The first occurrence strictly after `date`, or null when the rule has ended.
export function nextOccurrence(rule, date) {
  for (let n = 0; ; n += 1) {
    const next = occurrenceAt(rule, n);
    if (rule.endDate && next > rule.endDate) return null;
    if (next > date) return next;
  }
}
