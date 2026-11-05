import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

// Opens a SQLite database. Pass ':memory:' for a throwaway database in tests.
export function openDatabase(filename) {
  if (filename !== ':memory:') {
    fs.mkdirSync(path.dirname(filename), { recursive: true });
  }

  const db = new Database(filename);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  return db;
}
