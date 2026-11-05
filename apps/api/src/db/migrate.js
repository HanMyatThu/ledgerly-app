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
