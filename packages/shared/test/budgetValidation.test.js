import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateBudget } from '../src/validation.js';

const valid = { month: '2026-11', categoryId: 'groceries', amountCents: 40000 };

test('accepts a valid budget', () => {
  assert.deepEqual(validateBudget(valid), {});
});

test('rejects a malformed month', () => {
  for (const month of ['2026-13', '2026-1', '26-11', '', undefined]) {
    assert.ok(validateBudget({ ...valid, month }).month, `month ${month}`);
  }
});

test('rejects unknown and income categories', () => {
  assert.ok(validateBudget({ ...valid, categoryId: 'nope' }).categoryId);
  assert.match(validateBudget({ ...valid, categoryId: 'salary' }).categoryId, /expense/);
});

test('rejects non-positive or fractional amounts', () => {
  for (const amountCents of [0, -100, 10.5, '400']) {
    assert.ok(validateBudget({ ...valid, amountCents }).amountCents, `amount ${amountCents}`);
  }
});

test('handles missing input', () => {
  assert.deepEqual(Object.keys(validateBudget()).sort(), ['amountCents', 'categoryId', 'month']);
});
