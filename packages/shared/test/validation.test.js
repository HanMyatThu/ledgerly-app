import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateTransaction } from '../src/validation.js';

const valid = { type: 'expense', amountCents: 1250, categoryId: 'groceries', date: '2026-11-01' };

test('accepts a valid transaction', () => {
  assert.deepEqual(validateTransaction(valid), {});
});

test('rejects non-positive amounts', () => {
  assert.ok(validateTransaction({ ...valid, amountCents: 0 }).amountCents);
});

test('rejects a category from the other type', () => {
  assert.ok(validateTransaction({ ...valid, categoryId: 'salary' }).categoryId);
});

test('rejects malformed dates', () => {
  assert.ok(validateTransaction({ ...valid, date: '01/11/2026' }).date);
});
