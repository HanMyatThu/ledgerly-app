import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseListQuery } from '../src/listQuery.js';

test('empty query gives no filters', () => {
  assert.deepEqual(parseListQuery(), {});
  assert.deepEqual(parseListQuery({}), {});
});

test('reads every supported filter', () => {
  assert.deepEqual(
    parseListQuery({ from: '2026-11-01', to: '2026-11-30', type: 'expense', category: 'dining', q: 'lunch' }),
    { from: '2026-11-01', to: '2026-11-30', type: 'expense', categoryId: 'dining', q: 'lunch' },
  );
});

test('drops malformed values', () => {
  assert.deepEqual(parseListQuery({ from: 'yesterday', to: '2026-1-5', type: 'gift', category: '  ', q: '   ' }), {});
});

test('ignores non-string values such as repeated params', () => {
  assert.deepEqual(parseListQuery({ type: ['income', 'expense'], q: ['a', 'b'] }), {});
});

test('trims and caps the search text', () => {
  assert.equal(parseListQuery({ q: '  coffee  ' }).q, 'coffee');
  assert.equal(parseListQuery({ q: 'x'.repeat(300) }).q.length, 100);
});

test('accepts URLSearchParams', () => {
  const params = new URLSearchParams('type=income&category=salary');
  assert.deepEqual(parseListQuery(params), { type: 'income', categoryId: 'salary' });
});

test('reads limit and offset, capping the limit', () => {
  assert.deepEqual(parseListQuery({ limit: '20', offset: '40' }), { limit: 20, offset: 40 });
  assert.equal(parseListQuery({ limit: '5000' }).limit, 200);
  assert.deepEqual(parseListQuery({ limit: '0', offset: '-1' }), {});
  assert.deepEqual(parseListQuery({ limit: '2.5' }), {});
});
