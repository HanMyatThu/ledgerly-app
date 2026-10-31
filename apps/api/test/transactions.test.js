import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

let server;
let base;

before(async () => {
  server = createApp().listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}/api/transactions`;
});

after(() => server.close());

const sample = { type: 'expense', amountCents: 899, categoryId: 'dining', date: '2026-11-01', note: 'Lunch' };

test('creates, reads, updates and deletes a transaction', async () => {
  const created = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sample),
  });
  assert.equal(created.status, 201);
  const { id } = await created.json();

  const list = await (await fetch(base)).json();
  assert.equal(list.length, 1);

  const updated = await fetch(`${base}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountCents: 1099 }),
  });
  assert.equal((await updated.json()).amountCents, 1099);

  assert.equal((await fetch(`${base}/${id}`, { method: 'DELETE' })).status, 204);
  assert.equal((await fetch(`${base}/${id}`)).status, 404);
});

test('rejects invalid payloads', async () => {
  const res = await fetch(base, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...sample, amountCents: -5 }),
  });
  assert.equal(res.status, 400);
  assert.ok((await res.json()).errors.amountCents);
});
