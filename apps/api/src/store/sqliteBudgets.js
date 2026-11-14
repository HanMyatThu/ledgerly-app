function fromRow(row) {
  if (!row) return null;
  return {
    month: row.month,
    categoryId: row.category_id,
    amountCents: row.amount_cents,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// Monthly budgets, keyed by month and category.
export function createSqliteBudgetStore(db) {
  const listStmt = db.prepare('SELECT * FROM budgets WHERE month = ? ORDER BY category_id');
  const getStmt = db.prepare('SELECT * FROM budgets WHERE month = ? AND category_id = ?');
  const removeStmt = db.prepare('DELETE FROM budgets WHERE month = ? AND category_id = ?');
  const upsertStmt = db.prepare(`
    INSERT INTO budgets (month, category_id, amount_cents, created_at, updated_at)
    VALUES (@month, @categoryId, @amountCents, @now, @now)
    ON CONFLICT (month, category_id)
    DO UPDATE SET amount_cents = excluded.amount_cents, updated_at = excluded.updated_at
  `);

  return {
    list(month) {
      return listStmt.all(month).map(fromRow);
    },
    get(month, categoryId) {
      return fromRow(getStmt.get(month, categoryId));
    },
    // Creates the budget, or replaces the amount if one already exists.
    upsert({ month, categoryId, amountCents }) {
      upsertStmt.run({ month, categoryId, amountCents, now: new Date().toISOString() });
      return fromRow(getStmt.get(month, categoryId));
    },
    remove(month, categoryId) {
      return removeStmt.run(month, categoryId).changes > 0;
    },
  };
}
