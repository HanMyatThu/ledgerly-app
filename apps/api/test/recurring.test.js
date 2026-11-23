import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store/index.js';

const rent = {
  type: 'expense',
  amountCents: 120000,
  categoryId: 'housing',
  note: 'Rent',
  frequency: 'monthly',
  startDate: '2026-11-01',
};

describe('recurring API', () => {
  let server;
  let db;
  let base;

  before(async () => {
    const created = createStore({ store: 'sqlite', databasePath: ':memory:' });
    db = created.db;
    server = createApp(created).listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://localhost:${server.address().port}/api/recurring`;
  });

  after(() => {
    server.close();
    db?.close();
  });

  const json = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

  test('creates, reads, updates and deletes a rule', async () => {
    const created = await fetch(base, json('POST', rent));
    assert.equal(created.status, 201);
    const rule = await created.json();
    assert.equal(rule.frequency, 'monthly');
    assert.equal(rule.paused, false);

    assert.deepEqual(await (await fetch(`${base}/${rule.id}`)).json(), rule);
    assert.ok((await (await fetch(base)).json()).some((item) => item.id === rule.id));

    const updated = await (await fetch(`${base}/${rule.id}`, json('PUT', { amountCents: 125000 }))).json();
    assert.equal(updated.amountCents, 125000);
    assert.equal(updated.note, 'Rent');

    assert.equal((await fetch(`${base}/${rule.id}`, { method: 'DELETE' })).status, 204);
    assert.equal((await fetch(`${base}/${rule.id}`)).status, 404);
  });

  test('pauses and resumes a rule', async () => {
    const rule = await (await fetch(base, json('POST', rent))).json();
    const paused = await (await fetch(`${base}/${rule.id}/pause`, { method: 'POST' })).json();
    assert.equal(paused.paused, true);
    const resumed = await (await fetch(`${base}/${rule.id}/resume`, { method: 'POST' })).json();
    assert.equal(resumed.paused, false);
  });

  test('rejects invalid rules with errors per field', async () => {
    const res = await fetch(base, json('POST', { ...rent, frequency: 'daily', startDate: 'soon', categoryId: 'salary' }));
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.deepEqual(Object.keys(body.errors).sort(), ['categoryId', 'frequency', 'startDate']);
  });

  test('rejects an end date before the start date', async () => {
    const res = await fetch(base, json('POST', { ...rent, endDate: '2026-10-01' }));
    assert.equal(res.status, 400);
    assert.match((await res.json()).errors.endDate, /before the start date/);
  });

  test('validates updates against the whole rule', async () => {
    const rule = await (await fetch(base, json('POST', rent))).json();
    const res = await fetch(`${base}/${rule.id}`, json('PUT', { type: 'income' }));
    assert.equal(res.status, 400);
    assert.ok((await res.json()).errors.categoryId);
  });

  test('answers 404 for unknown rules', async () => {
    assert.equal((await fetch(`${base}/nope`, json('PUT', rent))).status, 404);
    assert.equal((await fetch(`${base}/nope/pause`, { method: 'POST' })).status, 404);
    assert.equal((await fetch(`${base}/nope`, { method: 'DELETE' })).status, 404);
  });
});
