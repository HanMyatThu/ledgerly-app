import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}`;
});

after(() => server.close());

test('malformed JSON gets a 400 JSON error', async () => {
  const res = await fetch(`${base}/api/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{"type":',
  });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).error);
});

test('unknown routes get a 404 JSON error', async () => {
  const res = await fetch(`${base}/api/nope`);
  assert.equal(res.status, 404);
  assert.equal((await res.json()).error, 'Route not found');
});
