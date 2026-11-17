// Month helpers for "YYYY-MM" strings, computed in UTC so they never
// depend on the server's time zone.
export const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

export function currentMonth(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(month, delta) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function monthRange(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, '0')}` };
}

// Every month from `from` to `to`, inclusive.
export function monthsBetween(from, to) {
  const months = [];
  for (let month = from; month <= to && months.length < 120; month = shiftMonth(month, 1)) months.push(month);
  return months;
}
