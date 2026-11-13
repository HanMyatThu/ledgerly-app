import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupByDay, netTotal } from '../src/lib/groupByDay.js';

const tx = (date, type, amountCents) => ({ date, type, amountCents });

test('groups consecutive transactions by date', () => {
  const groups = groupByDay([tx('2026-11-03', 'expense', 1), tx('2026-11-03', 'expense', 2), tx('2026-11-01', 'income', 3)]);
  assert.deepEqual(
    groups.map((group) => [group.date, group.items.length]),
    [
      ['2026-11-03', 2],
      ['2026-11-01', 1],
    ],
  );
});

test('empty list gives no groups', () => {
  assert.deepEqual(groupByDay([]), []);
});

test('netTotal adds income and subtracts expenses', () => {
  assert.equal(netTotal([tx('d', 'income', 1000), tx('d', 'expense', 250)]), 750);
  assert.equal(netTotal([tx('d', 'expense', 400)]), -400);
});
