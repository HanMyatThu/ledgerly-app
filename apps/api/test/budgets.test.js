import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store/index.js';

const STORES = {
  memory: { store: 'memory' },
  sqlite: { store: 'sqlite', databasePath: ':memory:' },
};

for (const [name, config] of Object.entries(STORES)) {
  describe(`budgets API with the ${name} store`, () => {
    let server;
    let db;
    let base;

    before(async () => {
      const created = createStore(config);
      db = created.db;
      server = createApp(created).listen(0);
      await new Promise((resolve) => server.once('listening', resolve));
      base = `http://localhost:${server.address().port}/api/budgets`;
    });

    after(() => {
      server.close();
      db?.close();
    });

    const put = (path, body) =>
      fetch(`${base}/${path}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

    test('creates, lists, updates and deletes a budget', async () => {
      const created = await put('2026-11/groceries', { amountCents: 40000 });
      assert.equal(created.status, 201);
      assert.equal((await created.json()).amountCents, 40000);

      const updated = await put('2026-11/groceries', { amountCents: 45000 });
      assert.equal(updated.status, 200);

      const list = await (await fetch(`${base}?month=2026-11`)).json();
      assert.deepEqual(
        list.map((budget) => [budget.categoryId, budget.amountCents]),
        [['groceries', 45000]],
      );

      assert.equal((await fetch(`${base}/2026-11/groceries`, { method: 'DELETE' })).status, 204);
      assert.equal((await fetch(`${base}/2026-11/groceries`, { method: 'DELETE' })).status, 404);
      assert.deepEqual(await (await fetch(`${base}?month=2026-11`)).json(), []);
    });

    test('requires a valid month to list', async () => {
      assert.equal((await fetch(base)).status, 400);
      assert.equal((await fetch(`${base}?month=2026-13`)).status, 400);
    });

    test('rejects invalid budgets with field errors', async () => {
      const income = await put('2026-11/salary', { amountCents: 1000 });
      assert.equal(income.status, 400);
      assert.ok((await income.json()).errors.categoryId);

      const negative = await put('2026-11/dining', { amountCents: -5 });
      assert.ok((await negative.json()).errors.amountCents);

      const badMonth = await put('2026-1/dining', { amountCents: 500 });
      assert.ok((await badMonth.json()).errors.month);
    });
  });
}
