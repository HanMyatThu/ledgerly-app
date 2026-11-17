import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store/index.js';

const FIXTURES = [
  { type: 'income', categoryId: 'salary', amountCents: 300000, date: '2026-09-01' },
  { type: 'expense', categoryId: 'housing', amountCents: 120000, date: '2026-09-01' },
  { type: 'expense', categoryId: 'dining', amountCents: 2500, date: '2026-09-15' },
  { type: 'income', categoryId: 'salary', amountCents: 300000, date: '2026-11-01' },
  { type: 'expense', categoryId: 'dining', amountCents: 4000, date: '2026-11-03' },
  { type: 'expense', categoryId: 'dining', amountCents: 1500, date: '2026-11-20' },
  { type: 'expense', categoryId: 'groceries', amountCents: 9000, date: '2026-11-21' },
  { type: 'expense', categoryId: 'transport', amountCents: 3000, date: '2026-11-30' },
  { type: 'expense', categoryId: 'transport', amountCents: 7777, date: '2026-12-01' },
];

const STORES = {
  memory: { store: 'memory' },
  sqlite: { store: 'sqlite', databasePath: ':memory:' },
};

for (const [name, config] of Object.entries(STORES)) {
  describe(`reports API with the ${name} store`, () => {
    let server;
    let db;
    let base;

    before(async () => {
      const created = createStore(config);
      db = created.db;
      for (const item of FIXTURES) created.store.create(item);
      server = createApp(created).listen(0);
      await new Promise((resolve) => server.once('listening', resolve));
      base = `http://localhost:${server.address().port}/api/reports`;
    });

    after(() => {
      server.close();
      db?.close();
    });

    const get = async (path) => {
      const res = await fetch(`${base}${path}`);
      return { status: res.status, body: await res.json() };
    };

    test('monthly totals cover every month in the span, including empty ones', async () => {
      const { body } = await get('/monthly?from=2026-09&to=2026-11');
      assert.deepEqual(body, [
        { month: '2026-09', incomeCents: 300000, expenseCents: 122500, netCents: 177500 },
        { month: '2026-10', incomeCents: 0, expenseCents: 0, netCents: 0 },
        { month: '2026-11', incomeCents: 300000, expenseCents: 17500, netCents: 282500 },
      ]);
    });

    test('monthly defaults to six months', async () => {
      const { body } = await get('/monthly?to=2026-11');
      assert.deepEqual(
        body.map((row) => row.month),
        ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'],
      );
    });

    test('monthly rejects bad spans', async () => {
      assert.equal((await get('/monthly?from=2026-13')).status, 400);
      assert.equal((await get('/monthly?from=2026-11&to=2026-09')).status, 400);
    });
  });
}
