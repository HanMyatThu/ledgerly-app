import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { openDatabase } from '../src/db/connection.js';
import { runMigrations } from '../src/db/migrate.js';
import { migrations } from '../src/db/migrations/index.js';
import { createSqliteRecurringStore } from '../src/store/sqliteRecurring.js';

const rent = {
  type: 'expense',
  amountCents: 120000,
  categoryId: 'housing',
  note: 'Rent',
  frequency: 'monthly',
  startDate: '2026-11-01',
};

let db;
let recurring;

beforeEach(() => {
  db = openDatabase(':memory:');
  runMigrations(db, migrations);
  recurring = createSqliteRecurringStore(db);
});

afterEach(() => db.close());

test('create stores a rule with defaults', () => {
  const { note, ...withoutNote } = rent;
  const rule = recurring.create(withoutNote);
  assert.match(rule.id, /^[0-9a-f-]{36}$/);
  assert.equal(rule.paused, false);
  assert.equal(rule.lastDate, null);
  assert.equal(rule.endDate, null);
  assert.equal(rule.note, '');
  assert.deepEqual(recurring.get(rule.id), rule);
});

test('list returns rules by start date', () => {
  recurring.create({ ...rent, startDate: '2026-12-01' });
  recurring.create(rent);
  assert.deepEqual(
    recurring.list().map((rule) => rule.startDate),
    ['2026-11-01', '2026-12-01'],
  );
});

test('update changes fields and keeps progress', () => {
  const rule = recurring.create(rent);
  recurring.setLastDate(rule.id, '2026-11-01');
  const updated = recurring.update(rule.id, { amountCents: 125000, endDate: '2027-06-01' });
  assert.equal(updated.amountCents, 125000);
  assert.equal(updated.endDate, '2027-06-01');
  assert.equal(updated.lastDate, '2026-11-01');
  assert.equal(updated.note, 'Rent');
});

test('update can clear the end date', () => {
  const rule = recurring.create({ ...rent, endDate: '2027-01-01' });
  assert.equal(recurring.update(rule.id, { endDate: null }).endDate, null);
});

test('update returns null for an unknown id', () => {
  assert.equal(recurring.update('nope', { amountCents: 1 }), null);
});

test('setPaused hides a rule from listActive', () => {
  const rule = recurring.create(rent);
  recurring.create({ ...rent, note: 'Other' });
  assert.equal(recurring.setPaused(rule.id, true).paused, true);
  assert.deepEqual(
    recurring.listActive().map((item) => item.note),
    ['Other'],
  );
  assert.equal(recurring.setPaused(rule.id, false).paused, false);
  assert.equal(recurring.listActive().length, 2);
});

test('remove deletes a rule once', () => {
  const rule = recurring.create(rent);
  assert.equal(recurring.remove(rule.id), true);
  assert.equal(recurring.remove(rule.id), false);
  assert.equal(recurring.get(rule.id), null);
});

test('the database rejects an unknown frequency', () => {
  assert.throws(() => recurring.create({ ...rent, frequency: 'daily' }), /CHECK constraint/);
});
