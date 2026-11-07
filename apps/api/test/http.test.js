import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asyncHandler, HttpError, notFound } from '../src/http.js';

test('notFound builds a 404 HttpError', () => {
  const err = notFound('Budget');
  assert.ok(err instanceof HttpError);
  assert.equal(err.status, 404);
  assert.equal(err.message, 'Budget not found');
});

test('asyncHandler passes rejections to next', async () => {
  const boom = new Error('boom');
  const received = await new Promise((resolve) => {
    asyncHandler(async () => {
      throw boom;
    })({}, {}, resolve);
  });
  assert.equal(received, boom);
});

test('asyncHandler passes sync throws to next', async () => {
  const received = await new Promise((resolve) => {
    asyncHandler(() => {
      throw notFound();
    })({}, {}, resolve);
  });
  assert.equal(received.status, 404);
});
