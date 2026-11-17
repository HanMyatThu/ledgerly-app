import { randomUUID } from 'node:crypto';

function matches(item, { from, to, type, categoryId, q } = {}) {
  if (from && item.date < from) return false;
  if (to && item.date > to) return false;
  if (type && item.type !== type) return false;
  if (categoryId && item.categoryId !== categoryId) return false;
  if (q && !item.note.toLowerCase().includes(q.toLowerCase())) return false;
  return true;
}

const COMPARE = {
  date: (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt),
  amount: (a, b) => a.amountCents - b.amountCents || a.date.localeCompare(b.date),
};

function comparator(sort = '-date') {
  const descending = sort.startsWith('-');
  const compare = COMPARE[descending ? sort.slice(1) : sort] ?? COMPARE.date;
  return descending ? (a, b) => compare(b, a) : compare;
}

// In-memory store. Will be replaced by a database-backed store later.
export function createTransactionStore(seed = []) {
  const items = new Map(seed.map((item) => [item.id, item]));

  return {
    list(filters = {}) {
      const { limit, offset = 0 } = filters;
      const found = [...items.values()]
        .filter((item) => matches(item, filters))
        .sort(comparator(filters.sort));
      return found.slice(offset, limit ? offset + limit : undefined);
    },
    // Total expenses per category, e.g. { dining: 4250 }, within optional from/to dates.
    spentByCategory({ from, to } = {}) {
      const totals = {};
      for (const item of items.values()) {
        if (item.type !== 'expense' || !matches(item, { from, to })) continue;
        totals[item.categoryId] = (totals[item.categoryId] ?? 0) + item.amountCents;
      }
      return totals;
    },
    // Income and expense totals per month, oldest first, within optional from/to dates.
    monthlyTotals({ from, to } = {}) {
      const totals = new Map();
      for (const item of items.values()) {
        if (!matches(item, { from, to })) continue;
        const month = item.date.slice(0, 7);
        const entry = totals.get(month) ?? { month, incomeCents: 0, expenseCents: 0 };
        entry[item.type === 'income' ? 'incomeCents' : 'expenseCents'] += item.amountCents;
        totals.set(month, entry);
      }
      return [...totals.values()].sort((a, b) => a.month.localeCompare(b.month));
    },
    count(filters = {}) {
      return [...items.values()].filter((item) => matches(item, filters)).length;
    },
    get(id) {
      return items.get(id) ?? null;
    },
    create(data) {
      const now = new Date().toISOString();
      const item = { id: randomUUID(), note: '', ...data, createdAt: now, updatedAt: now };
      items.set(item.id, item);
      return item;
    },
    update(id, data) {
      const existing = items.get(id);
      if (!existing) return null;
      const item = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
      items.set(id, item);
      return item;
    },
    remove(id) {
      return items.delete(id);
    },
  };
}
