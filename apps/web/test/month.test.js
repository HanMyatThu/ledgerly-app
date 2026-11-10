import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentMonth, formatMonth, isMonth, monthRange, shiftMonth } from '../src/lib/month.js';

test('currentMonth', () => {
  assert.equal(currentMonth(new Date(2026, 10, 10)), '2026-11');
});

test('shiftMonth crosses year boundaries', () => {
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftMonth('2026-05', 0), '2026-05');
});

test('monthRange handles month lengths and leap years', () => {
  assert.deepEqual(monthRange('2026-11'), { from: '2026-11-01', to: '2026-11-30' });
  assert.deepEqual(monthRange('2028-02'), { from: '2028-02-01', to: '2028-02-29' });
});

test('formatMonth and isMonth', () => {
  assert.equal(formatMonth('2026-11'), 'November 2026');
  assert.equal(isMonth('2026-11'), true);
  assert.equal(isMonth('2026-13'), false);
  assert.equal(isMonth('nope'), false);
});
