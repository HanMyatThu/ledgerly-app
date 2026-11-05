export const name = '001-create-transactions';

export function up(db) {
  db.exec(`
    CREATE TABLE transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      category_id TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX transactions_date_idx ON transactions (date);
    CREATE INDEX transactions_category_idx ON transactions (category_id);
  `);
}
