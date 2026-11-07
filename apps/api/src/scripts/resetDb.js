// Deletes the SQLite database file and recreates an empty, migrated one.
// Usage: npm run db:reset
import fs from 'node:fs';
import { config } from '../config.js';
import { setupDatabase } from '../db/index.js';

for (const suffix of ['', '-wal', '-shm']) {
  fs.rmSync(`${config.databasePath}${suffix}`, { force: true });
}

setupDatabase(config.databasePath).close();
console.log(`Reset database at ${config.databasePath}`);
