import { setupDatabase } from '../db/index.js';
import { createSqliteBudgetStore } from './sqliteBudgets.js';
import { createSqliteTransactionStore } from './sqliteTransactions.js';
import { createTransactionStore } from './transactions.js';

const quiet = () => {};

// Budgets always live in SQLite; without a database file they use a
// throwaway in-memory one.
export function createMemoryBudgetStore() {
  return createSqliteBudgetStore(setupDatabase(':memory:', { log: quiet }));
}

// Builds the stores named by config.store.
// Returns the database too (null for memory) so the caller can close it.
export function createStore(config) {
  if (config.store === 'memory') {
    return { store: createTransactionStore(), budgets: createMemoryBudgetStore(), db: null };
  }
  const db = setupDatabase(config.databasePath, config.databasePath === ':memory:' ? { log: quiet } : undefined);
  return { store: createSqliteTransactionStore(db), budgets: createSqliteBudgetStore(db), db };
}
