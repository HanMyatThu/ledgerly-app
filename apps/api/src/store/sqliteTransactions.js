import { randomUUID } from 'node:crypto';

const COLUMNS = 'id, type, amount_cents, category_id, date, note, created_at, updated_at';

function fromRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    amountCents: row.amount_cents,
    categoryId: row.category_id,
    date: row.date,
    note: row.note,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// SQLite-backed store with the same interface as the in-memory store.
export function createSqliteTransactionStore(db) {
  const listStmt = db.prepare(`SELECT ${COLUMNS} FROM transactions ORDER BY date DESC, created_at DESC`);
  const getStmt = db.prepare(`SELECT ${COLUMNS} FROM transactions WHERE id = ?`);
  const insertStmt = db.prepare(`
    INSERT INTO transactions (${COLUMNS})
    VALUES (@id, @type, @amountCents, @categoryId, @date, @note, @createdAt, @updatedAt)
  `);
  const updateStmt = db.prepare(`
    UPDATE transactions
    SET type = @type, amount_cents = @amountCents, category_id = @categoryId,
        date = @date, note = @note, updated_at = @updatedAt
    WHERE id = @id
  `);
  const removeStmt = db.prepare('DELETE FROM transactions WHERE id = ?');

  return {
    list() {
      return listStmt.all().map(fromRow);
    },
    get(id) {
      return fromRow(getStmt.get(id));
    },
    create(data) {
      const now = new Date().toISOString();
      const item = { id: randomUUID(), note: '', ...data, createdAt: now, updatedAt: now };
      insertStmt.run(item);
      return item;
    },
    update(id, data) {
      const existing = fromRow(getStmt.get(id));
      if (!existing) return null;
      const item = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
      updateStmt.run(item);
      return item;
    },
    remove(id) {
      return removeStmt.run(id).changes > 0;
    },
  };
}
