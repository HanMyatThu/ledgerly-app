import { currentMonth, isMonth } from './month.js';

const FILTER_KEYS = ['type', 'category', 'q', 'sort'];

// Reads the month and list filters from a query string like "?month=2026-11&type=expense".
export function readUrlState(search = window.location.search) {
  const params = new URLSearchParams(search);
  const month = params.get('month');
  const filters = {};
  for (const key of FILTER_KEYS) {
    const value = params.get(key);
    if (value) filters[key] = value;
  }
  return { month: isMonth(month) ? month : currentMonth(), filters };
}

// Builds the query string for the given state, leaving out defaults.
export function toUrlSearch({ month, filters }) {
  const params = new URLSearchParams();
  if (month && month !== currentMonth()) params.set('month', month);
  for (const key of FILTER_KEYS) {
    if (filters[key]) params.set(key, filters[key]);
  }
  const text = params.toString();
  return text ? `?${text}` : '';
}
