function pad(value) {
  return String(value).padStart(2, '0');
}

function parts(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  return { year, monthNumber };
}

export function currentMonth(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

export function isMonth(value) {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

// Moves a "YYYY-MM" month forward or back by a number of months.
export function shiftMonth(month, delta) {
  const { year, monthNumber } = parts(month);
  const date = new Date(year, monthNumber - 1 + delta, 1);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

// First and last day of a month, as API date filters.
export function monthRange(month) {
  const { year, monthNumber } = parts(month);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return { from: `${month}-01`, to: `${month}-${pad(lastDay)}` };
}

export function formatMonth(month) {
  const { year, monthNumber } = parts(month);
  return new Date(year, monthNumber - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
