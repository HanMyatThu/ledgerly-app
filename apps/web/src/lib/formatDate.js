const DAY_MS = 24 * 60 * 60 * 1000;

function parseIsoDate(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

// Turns a YYYY-MM-DD string into "Today", "Yesterday", "Mon, Nov 2"
// or, for other years, "Nov 2, 2025".
export function formatDate(iso, now = new Date()) {
  if (!iso) return '';
  const date = parseIsoDate(iso);
  if (Number.isNaN(date.getTime())) return iso;

  const diffDays = Math.round((startOfDay(now) - date) / DAY_MS);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
