// Today's date as YYYY-MM-DD in the server's local time zone,
// so a rule due "today" fires on the user's day, not UTC's.
export function localToday(now = new Date()) {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
