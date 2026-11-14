import * as createTransactions from './001-create-transactions.js';
import * as createBudgets from './002-create-budgets.js';

// Keep this list in order. Never edit a migration that has shipped;
// add a new one instead.
export const migrations = [createTransactions, createBudgets];
