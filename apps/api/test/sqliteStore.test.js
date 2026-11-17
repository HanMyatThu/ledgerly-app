import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';
import { migrations } from '../src/db/migrations/index.js';
import { createSqliteTransactionStore } from '../src/store/sqliteTransactions.js';

let db;
let store;

beforeEach(() => {
  db = openDatabase(':memory:');
  runMigrations(db, migrations);
  store = createSqliteTransactionStore(db);
});

afterEach(() => db.close());

const lunch = { type: 'expense', amountCents: 899, categoryId: 'dining', date: '2026-11-01', note: 'Lunch' };
const pay = { type: 'income', amountCents: 250000, categoryId: 'salary', date: '2026-11-03' };

test('create returns the stored item with id and timestamps', () => {
  const item = store.create(lunch);
  assert.ok(item.id);
  assert.ok(item.createdAt);
  assert.equal(item.createdAt, item.updatedAt);
  assert.deepEqual(store.get(item.id), item);
});

test('note defaults to an empty string', () => {
  assert.equal(store.create(pay).note, '');
});

test('list returns newest date first', () => {
  store.create(lunch);
  store.create(pay);
  assert.deepEqual(
    store.list().map((item) => item.date),
    ['2026-11-03', '2026-11-01'],
  );
});

test('get returns null for an unknown id', () => {
  assert.equal(store.get('missing'), null);
});

test('update merges fields and works when called unbound', () => {
  const { update } = store;
  const item = store.create(lunch);
  const updated = update(item.id, { amountCents: 1299, note: 'Dinner' });
  assert.equal(updated.amountCents, 1299);
  assert.equal(updated.note, 'Dinner');
  assert.equal(updated.categoryId, 'dining');
  assert.deepEqual(store.get(item.id), updated);
});

test('update returns null for an unknown id', () => {
  assert.equal(store.update('missing', { note: 'x' }), null);
});

test('remove deletes and reports whether anything was removed', () => {
  const item = store.create(lunch);
  assert.equal(store.remove(item.id), true);
  assert.equal(store.get(item.id), null);
  assert.equal(store.remove(item.id), false);
});

test('the database rejects a non-positive amount', () => {
  assert.throws(() => store.create({ ...lunch, amountCents: 0 }), /CHECK constraint/);
});

test('spentByCategory sums expenses per category within dates', () => {
  store.create(lunch);
  store.create({ ...lunch, amountCents: 101, date: '2026-11-02' });
  store.create({ ...lunch, categoryId: 'transport', amountCents: 500, date: '2026-10-31' });
  store.create(pay);
  assert.deepEqual(store.spentByCategory({ from: '2026-11-01', to: '2026-11-30' }), { dining: 1000 });
  assert.deepEqual(store.spentByCategory(), { dining: 1000, transport: 500 });
});

test('categoryTotals can return just the top categories', () => {
  store.create(lunch);
  store.create({ ...lunch, categoryId: 'groceries', amountCents: 5000 });
  store.create({ ...lunch, categoryId: 'transport', amountCents: 300 });
  assert.deepEqual(
    store.categoryTotals({ limit: 2 }).map((row) => row.categoryId),
    ['groceries', 'dining'],
  );
  assert.equal(store.categoryTotals().length, 3);
});
