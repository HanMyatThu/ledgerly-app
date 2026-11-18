import { monthRange } from './months.js';

// Number of days of `month` that have happened by `today` (YYYY-MM-DD):
// all of them for past months, today's day number for this month, 0 for future months.
export function daysElapsed(month, today) {
  const { to } = monthRange(month);
  const lastDay = Number(to.slice(8));
  const todayMonth = today.slice(0, 7);
  if (month < todayMonth) return lastDay;
  if (month > todayMonth) return 0;
  return Number(today.slice(8, 10));
}

// Average spend per day so far in the month, in whole cents.
export function averageDailySpend(expenseCents, month, today) {
  const days = daysElapsed(month, today);
  return days ? Math.round(expenseCents / days) : 0;
}

// Percent change from `previous` to `current`, rounded; null when there is
// nothing to compare against.
export function percentChange(current, previous) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}
