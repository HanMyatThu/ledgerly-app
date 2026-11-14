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

  return {
    list(month) {
      return listStmt.all(month).map(fromRow);
    },
  };
}
