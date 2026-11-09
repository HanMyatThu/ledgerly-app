const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TYPES = new Set(['income', 'expense']);
const MAX_SEARCH = 100;

function read(query, key) {
  const value = typeof query.get === 'function' ? query.get(key) : query[key];
  return typeof value === 'string' ? value : undefined;
}

// Turns a transactions list query (a plain object or URLSearchParams)
// into clean filters. Anything missing or malformed is left out.
export function parseListQuery(query = {}) {
  const filters = {};

  const from = read(query, 'from');
  if (from && DATE.test(from)) filters.from = from;

  const to = read(query, 'to');
  if (to && DATE.test(to)) filters.to = to;

  const type = read(query, 'type');
  if (TYPES.has(type)) filters.type = type;

  const category = read(query, 'category')?.trim();
  if (category) filters.categoryId = category;

  const q = read(query, 'q')?.trim();
  if (q) filters.q = q.slice(0, MAX_SEARCH);

  return filters;
}
