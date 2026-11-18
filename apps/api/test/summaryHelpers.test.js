import { test } from 'node:test';
import assert from 'node:assert/strict';
import { averageDailySpend, daysElapsed, percentChange } from '../src/lib/summary.js';

test('daysElapsed for past, current and future months', () => {
  assert.equal(daysElapsed('2026-10', '2026-11-18'), 31);
  assert.equal(daysElapsed('2026-02', '2026-11-18'), 28);
  assert.equal(daysElapsed('2026-11', '2026-11-18'), 18);
  assert.equal(daysElapsed('2026-12', '2026-11-18'), 0);
});

test('averageDailySpend divides by days so far', () => {
  assert.equal(averageDailySpend(18000, '2026-11', '2026-11-18'), 1000);
  assert.equal(averageDailySpend(31000, '2026-10', '2026-11-18'), 1000);
  assert.equal(averageDailySpend(5000, '2026-12', '2026-11-18'), 0);
  assert.equal(averageDailySpend(100, '2026-11', '2026-11-03'), 33);
});

test('percentChange', () => {
  assert.equal(percentChange(150, 100), 50);
  assert.equal(percentChange(50, 100), -50);
  assert.equal(percentChange(100, 0), null);
});
