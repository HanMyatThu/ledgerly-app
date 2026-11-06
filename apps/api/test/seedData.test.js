import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTransaction } from '@ledgerly/shared';
import { currentMonth, seedTransactions } from '../src/db/seedData.js';

test('every seed transaction is valid and inside the month', () => {
  const items = seedTransactions('2026-02');
  assert.ok(items.length >= 20);
  for (const item of items) {
    assert.deepEqual(validateTransaction(item), {});
    assert.ok(item.date.startsWith('2026-02-'));
  }
});

test('currentMonth formats as YYYY-MM', () => {
  assert.equal(currentMonth(new Date(2026, 0, 15)), '2026-01');
});
