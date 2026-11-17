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

const ORDER_BY = {
  '-date': 'date DESC, created_at DESC',
  date: 'date ASC, created_at ASC',
  '-amount': 'amount_cents DESC, date DESC',
  amount: 'amount_cents ASC, date ASC',
};

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
          `SELECT ${COLUMNS} FROM transactions ${where} ORDER BY ${ORDER_BY[filters.sort] ?? ORDER_BY['-date']} LIMIT @limit OFFSET @offset`,
        )
        .all({ ...params, ...paging })
        .map(fromRow);
    },
    // Total expenses per category, e.g. { dining: 4250 }, within optional from/to dates.
    spentByCategory({ from, to } = {}) {
      const { where, params } = buildWhere({ from, to, type: 'expense' });
      const rows = db
        .prepare(`SELECT category_id, SUM(amount_cents) AS total FROM transactions ${where} GROUP BY category_id`)
        .all(params);
      return Object.fromEntries(rows.map((row) => [row.category_id, row.total]));
    },
    // Income and expense totals per month, oldest first, within optional from/to dates.
    monthlyTotals({ from, to } = {}) {
      const { where, params } = buildWhere({ from, to });
      return db
        .prepare(
          `SELECT substr(date, 1, 7) AS month,
                  SUM(CASE WHEN type = 'income' THEN amount_cents ELSE 0 END) AS incomeCents,
                  SUM(CASE WHEN type = 'expense' THEN amount_cents ELSE 0 END) AS expenseCents
           FROM transactions ${where}
           GROUP BY month
           ORDER BY month`,
        )
        .all(params);
    },
    // Totals per category for one type, largest first: [{ categoryId, totalCents, count }].
    // Pass `limit` for just the top categories.
    categoryTotals({ from, to, type = 'expense', limit } = {}) {
      const { where, params } = buildWhere({ from, to, type });
      return db
        .prepare(
          `SELECT category_id AS categoryId, SUM(amount_cents) AS totalCents, COUNT(*) AS count
           FROM transactions ${where}
           GROUP BY category_id
           ORDER BY totalCents DESC, categoryId ASC
           LIMIT @limit`,
        )
        .all({ ...params, limit: limit ?? -1 });
    },
    count(filters = {}) {
      const { where, params } = buildWhere(filters);
      return db.prepare(`SELECT COUNT(*) AS total FROM transactions ${where}`).get(params).total;
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
