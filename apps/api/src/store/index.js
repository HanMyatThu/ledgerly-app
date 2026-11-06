import { setupDatabase } from '../db/index.js';
import { createSqliteTransactionStore } from './sqliteTransactions.js';
import { createTransactionStore } from './transactions.js';

// Builds the transaction store named by config.store.
// Returns the database too (null for memory) so the caller can close it.
export function createStore(config) {
  if (config.store === 'memory') {
    return { store: createTransactionStore(), db: null };
  }
  const db = setupDatabase(config.databasePath);
  return { store: createSqliteTransactionStore(db), db };
}
