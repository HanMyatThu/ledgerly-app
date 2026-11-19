// Fixed categorical colors, assigned per category (never by rank) so a
// category keeps its color across months and charts. Eight validated hues;
// the catch-all "Other" category stays neutral gray.
const PALETTE = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#008300', '#6250d6', '#e34948'];
const NEUTRAL = '#8a8984';

const ORDER = ['groceries', 'dining', 'transport', 'housing', 'utilities', 'health', 'entertainment', 'shopping'];

export function categoryColor(categoryId) {
  const index = ORDER.indexOf(categoryId);
  return index === -1 ? NEUTRAL : PALETTE[index];
}
