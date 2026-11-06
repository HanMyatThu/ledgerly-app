// Fills the SQLite database with a month of sample transactions.
// Usage: npm run seed [-- YYYY-MM]   (defaults to the current month)
import { config } from '../config.js';
import { setupDatabase } from '../db/index.js';
import { currentMonth, seedTransactions } from '../db/seedData.js';
import { createSqliteTransactionStore } from '../store/sqliteTransactions.js';

const month = process.argv[2] ?? currentMonth();
if (!/^\d{4}-\d{2}$/.test(month)) {
  console.error(`Expected a month like 2026-11, got "${month}"`);
  process.exit(1);
}

const db = setupDatabase(config.databasePath);
const store = createSqliteTransactionStore(db);
const items = seedTransactions(month);

db.transaction(() => {
  for (const item of items) store.create(item);
})();
db.close();

console.log(`Seeded ${items.length} transactions for ${month} into ${config.databasePath}`);
