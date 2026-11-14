import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';
import { migrations } from '../src/db/migrations/index.js';
import { createSqliteBudgetStore } from '../src/store/sqliteBudgets.js';

let db;
let budgets;

beforeEach(() => {
  db = openDatabase(':memory:');
  runMigrations(db, migrations);
  budgets = createSqliteBudgetStore(db);
});

afterEach(() => db.close());

test('upsert creates a budget', () => {
  const budget = budgets.upsert({ month: '2026-11', categoryId: 'groceries', amountCents: 40000 });
  assert.equal(budget.amountCents, 40000);
  assert.ok(budget.createdAt);
  assert.deepEqual(budgets.get('2026-11', 'groceries'), budget);
});

test('upsert replaces the amount and keeps createdAt', () => {
  const first = budgets.upsert({ month: '2026-11', categoryId: 'groceries', amountCents: 40000 });
  const second = budgets.upsert({ month: '2026-11', categoryId: 'groceries', amountCents: 45000 });
  assert.equal(second.amountCents, 45000);
  assert.equal(second.createdAt, first.createdAt);
  assert.equal(budgets.list('2026-11').length, 1);
});

test('list returns only the given month, sorted by category', () => {
  budgets.upsert({ month: '2026-11', categoryId: 'transport', amountCents: 5000 });
  budgets.upsert({ month: '2026-11', categoryId: 'dining', amountCents: 10000 });
  budgets.upsert({ month: '2026-10', categoryId: 'dining', amountCents: 9000 });
  assert.deepEqual(
    budgets.list('2026-11').map((budget) => budget.categoryId),
    ['dining', 'transport'],
  );
  assert.deepEqual(budgets.list('2026-09'), []);
});

test('remove deletes and reports whether anything was removed', () => {
  budgets.upsert({ month: '2026-11', categoryId: 'dining', amountCents: 10000 });
  assert.equal(budgets.remove('2026-11', 'dining'), true);
  assert.equal(budgets.get('2026-11', 'dining'), null);
  assert.equal(budgets.remove('2026-11', 'dining'), false);
});
