import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toCents, fromCents, formatMoney } from '../src/money.js';

test('toCents rounds to whole cents', () => {
  assert.equal(toCents(12.345), 1235);
  assert.equal(toCents('0.1'), 10);
  assert.ok(Number.isNaN(toCents('abc')));
});

test('fromCents converts back to units', () => {
  assert.equal(fromCents(1999), 19.99);
});

test('formatMoney formats as currency', () => {
  assert.equal(formatMoney(123456), '$1,234.56');
});
