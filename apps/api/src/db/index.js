import { openDatabase } from './connection.js';
import { runMigrations } from './migrate.js';
import { migrations } from './migrations/index.js';

// Opens the database and brings its schema up to date.
export function setupDatabase(filename, { log = console.log } = {}) {
  const db = openDatabase(filename);
  const applied = runMigrations(db, migrations);
  if (applied.length) log(`Applied migrations: ${applied.join(', ')}`);
  return db;
}
