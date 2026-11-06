import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store/index.js';

const sample = { type: 'expense', amountCents: 899, categoryId: 'dining', date: '2026-11-01', note: 'Lunch' };

const STORES = {
  memory: { store: 'memory' },
  sqlite: { store: 'sqlite', databasePath: ':memory:' },
};

// The same CRUD checks run against every store, so they stay interchangeable.
for (const [name, config] of Object.entries(STORES)) {
  describe(`transactions API with the ${name} store`, () => {
    let server;
    let db;
    let base;

    before(async () => {
      const created = createStore(config);
      db = created.db;
      server = createApp({ store: created.store }).listen(0);
      await new Promise((resolve) => server.once('listening', resolve));
      base = `http://localhost:${server.address().port}/api/transactions`;
    });

    after(() => {
      server.close();
      db?.close();
    });

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

      const fetched = await (await fetch(`${base}/${id}`)).json();
      assert.equal(fetched.note, 'Lunch');

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

    test('returns 404 for unknown ids', async () => {
      assert.equal((await fetch(`${base}/missing`)).status, 404);
      assert.equal((await fetch(`${base}/missing`, { method: 'DELETE' })).status, 404);
    });
  });
}
