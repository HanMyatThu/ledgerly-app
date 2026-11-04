import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDate } from '../src/lib/formatDate.js';

const now = new Date(2026, 10, 4, 15, 30);

test('today and yesterday get friendly names', () => {
  assert.equal(formatDate('2026-11-04', now), 'Today');
  assert.equal(formatDate('2026-11-03', now), 'Yesterday');
});

test('same year shows weekday, month and day', () => {
  assert.equal(formatDate('2026-11-02', now), 'Mon, Nov 2');
});

test('other years include the year', () => {
  assert.equal(formatDate('2025-12-31', now), 'Dec 31, 2025');
});

test('empty and invalid input', () => {
  assert.equal(formatDate('', now), '');
  assert.equal(formatDate('not-a-date', now), 'not-a-date');
});
