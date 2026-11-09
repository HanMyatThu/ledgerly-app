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

// Turns list filters into a WHERE clause with named parameters.
function buildWhere({ from, to, type, categoryId, q } = {}) {
  const clauses = [];
  const params = {};
  if (from) {
    clauses.push('date >= @from');
    params.from = from;
  }
  if (to) {
    clauses.push('date <= @to');
    params.to = to;
  }
  if (type) {
    clauses.push('type = @type');
    params.type = type;
  }
  if (categoryId) {
    clauses.push('category_id = @categoryId');
    params.categoryId = categoryId;
  }
  if (q) {
    // Case-insensitive substring match; escape LIKE wildcards in the search text.
    clauses.push("note LIKE @q ESCAPE '\\'");
    params.q = `%${q.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
  }
  return { where: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', params };
}

// SQLite-backed store with the same interface as the in-memory store.
export function createSqliteTransactionStore(db) {
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
    list(filters = {}) {
      const { where, params } = buildWhere(filters);
      // LIMIT -1 means no limit in SQLite.
      const paging = { limit: filters.limit ?? -1, offset: filters.offset ?? 0 };
      return db
        .prepare(
          `SELECT ${COLUMNS} FROM transactions ${where} ORDER BY date DESC, created_at DESC LIMIT @limit OFFSET @offset`,
        )
        .all({ ...params, ...paging })
        .map(fromRow);
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
