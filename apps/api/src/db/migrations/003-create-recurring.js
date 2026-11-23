export const name = '003-create-recurring';

// Rules that add a transaction every week or month. last_date is the most recent
// occurrence already turned into a transaction, so the materializer knows where to resume.
// Generated transactions point back to their rule through recurring_id.
export function up(db) {
  db.exec(`
    CREATE TABLE recurring (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      category_id TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly')),
      start_date TEXT NOT NULL,
      end_date TEXT,
      last_date TEXT,
      paused INTEGER NOT NULL DEFAULT 0 CHECK (paused IN (0, 1)),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    ALTER TABLE transactions ADD COLUMN recurring_id TEXT REFERENCES recurring (id) ON DELETE SET NULL;
    CREATE INDEX transactions_recurring_idx ON transactions (recurring_id);
  `);
}
