export const name = '002-create-budgets';

// One spending limit per expense category per month.
export function up(db) {
  db.exec(`
    CREATE TABLE budgets (
      month TEXT NOT NULL,
      category_id TEXT NOT NULL,
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (month, category_id)
    )
  `);
}
