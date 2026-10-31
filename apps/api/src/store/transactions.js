import { randomUUID } from 'node:crypto';

// In-memory store. Will be replaced by a database-backed store later.
export function createTransactionStore(seed = []) {
  const items = new Map(seed.map((item) => [item.id, item]));

  return {
    list() {
      return [...items.values()].sort((a, b) => b.date.localeCompare(a.date));
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
