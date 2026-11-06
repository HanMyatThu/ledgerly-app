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

  return {
    list() {
      return listStmt.all().map(fromRow);
    },
  };
}
