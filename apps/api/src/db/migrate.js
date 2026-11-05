export function ensureMigrationsTable(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL
    )
  `);
}

export function appliedMigrations(db) {
  ensureMigrationsTable(db);
  return db.prepare('SELECT name FROM migrations ORDER BY id').all().map((row) => row.name);
}

// Applies each migration whose name is not yet recorded, in order.
// Each migration runs inside its own transaction, so a failure leaves
// the database as it was before that migration.
export function runMigrations(db, migrations) {
  const done = new Set(appliedMigrations(db));
  const record = db.prepare('INSERT INTO migrations (name, applied_at) VALUES (?, ?)');
  const applied = [];

  for (const migration of migrations) {
    if (done.has(migration.name)) continue;
    db.transaction(() => {
      migration.up(db);
      record.run(migration.name, new Date().toISOString());
    })();
    applied.push(migration.name);
  }

  return applied;
}
