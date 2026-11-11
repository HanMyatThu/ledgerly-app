import { test } from 'node:test';
import assert from 'node:assert/strict';
import { currentMonth } from '../src/lib/month.js';
import { readUrlState, toUrlSearch } from '../src/lib/urlState.js';

test('reads month and filters', () => {
  assert.deepEqual(readUrlState('?month=2026-10&type=expense&q=coffee&foo=bar'), {
    month: '2026-10',
    filters: { type: 'expense', q: 'coffee' },
  });
});

test('falls back to the current month', () => {
  assert.equal(readUrlState('?month=garbage').month, currentMonth());
  assert.equal(readUrlState('').month, currentMonth());
});

test('writes only non-default values', () => {
  assert.equal(toUrlSearch({ month: currentMonth(), filters: {} }), '');
  assert.equal(
    toUrlSearch({ month: '2026-10', filters: { category: 'dining', q: undefined } }),
    '?month=2026-10&category=dining',
  );
});

test('round-trips', () => {
  const state = { month: '2025-12', filters: { type: 'income', sort: '-amount' } };
  assert.deepEqual(readUrlState(toUrlSearch(state)), state);
});
