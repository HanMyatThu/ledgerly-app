import { addDays, nextOccurrence } from '@ledgerly/shared';

function ordinal(day) {
  const rem100 = day % 100;
  if (rem100 >= 11 && rem100 <= 13) return `${day}th`;
  return `${day}${{ 1: 'st', 2: 'nd', 3: 'rd' }[day % 10] ?? 'th'}`;
}

// "Every week on Monday" or "Every month on the 31st (or the last day)".
export function describeSchedule(rule) {
  const [y, m, d] = rule.startDate.split('-').map(Number);
  if (rule.frequency === 'weekly') {
    const weekday = new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long' });
    return `Every week on ${weekday}`;
  }
  const lastDayNote = d > 28 ? ' (or the last day)' : '';
  return `Every month on the ${ordinal(d)}${lastDayNote}`;
}

// The next date this rule will add a transaction, or null once it has ended.
export function nextRuleDate(rule) {
  return nextOccurrence(rule, rule.lastDate ?? addDays(rule.startDate, -1));
}
