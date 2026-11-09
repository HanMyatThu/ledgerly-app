import { randomUUID } from 'node:crypto';

function matches(item, { from, to, type, categoryId, q } = {}) {
  if (from && item.date < from) return false;
  if (to && item.date > to) return false;
  if (type && item.type !== type) return false;
  if (categoryId && item.categoryId !== categoryId) return false;
  if (q && !item.note.toLowerCase().includes(q.toLowerCase())) return false;
  return true;
}

// In-memory store. Will be replaced by a database-backed store later.
export function createTransactionStore(seed = []) {
  const items = new Map(seed.map((item) => [item.id, item]));

  return {
    list(filters = {}) {
      const { limit, offset = 0 } = filters;
      const found = [...items.values()]
        .filter((item) => matches(item, filters))
        .sort((a, b) => b.date.localeCompare(a.date));
      return found.slice(offset, limit ? offset + limit : undefined);
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
