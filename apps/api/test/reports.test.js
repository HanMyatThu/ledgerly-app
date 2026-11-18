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
      server = createApp({ ...created, today: () => '2026-11-18' }).listen(0);
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

    test('category totals for a month, largest first, with share', async () => {
      const { body } = await get('/categories?month=2026-11');
      assert.deepEqual(body, [
        { categoryId: 'groceries', totalCents: 9000, count: 1, percent: 51 },
        { categoryId: 'dining', totalCents: 5500, count: 2, percent: 31 },
        { categoryId: 'transport', totalCents: 3000, count: 1, percent: 17 },
      ]);
    });

    test('category totals for income', async () => {
      const { body } = await get('/categories?month=2026-11&type=income');
      assert.deepEqual(body, [{ categoryId: 'salary', totalCents: 300000, count: 1, percent: 100 }]);
    });

    test('category totals for an empty month', async () => {
      assert.deepEqual((await get('/categories?month=2026-10')).body, []);
    });

    test('category totals reject bad input', async () => {
      assert.equal((await get('/categories?month=11-2026')).status, 400);
      assert.equal((await get('/categories?type=gift')).status, 400);
    });

    test('top returns the biggest spending categories', async () => {
      const { body } = await get('/top?month=2026-11&limit=2');
      assert.deepEqual(
        body.map((row) => [row.categoryId, row.totalCents, row.percent]),
        [
          ['groceries', 9000, 51],
          ['dining', 5500, 31],
        ],
      );
    });

    test('top defaults to five and never includes income', async () => {
      const { body } = await get('/top?month=2026-11');
      assert.equal(body.length, 3);
      assert.ok(body.every((row) => row.categoryId !== 'salary'));
    });

    test('top rejects a bad limit', async () => {
      for (const limit of ['0', '21', 'abc', '2.5']) {
        assert.equal((await get(`/top?limit=${limit}`)).status, 400, `limit ${limit}`);
      }
    });

    test('summary totals a month', async () => {
      const { body } = await get('/summary?month=2026-11');
      assert.equal(body.month, '2026-11');
      assert.equal(body.incomeCents, 300000);
      assert.equal(body.expenseCents, 17500);
      assert.equal(body.balanceCents, 282500);
      assert.equal(body.count, 5);
      // 17500 cents over the 18 days so far.
      assert.equal(body.averageDailySpendCents, 972);
    });

    test('summary compares with the previous month', async () => {
      const { body } = await get('/summary?month=2026-10');
      assert.deepEqual(body.previous, {
        month: '2026-09',
        incomeCents: 300000,
        expenseCents: 122500,
        incomeChangePercent: -100,
        expenseChangePercent: -100,
      });
      const november = (await get('/summary?month=2026-11')).body;
      assert.equal(november.previous.expenseChangePercent, null);
    });

    test('summary of an empty month is all zeros', async () => {
      const { body } = await get('/summary?month=2026-10');
      assert.equal(body.incomeCents, 0);
      assert.equal(body.expenseCents, 0);
      assert.equal(body.count, 0);
      assert.equal(body.averageDailySpendCents, 0);
    });

    test('summary rejects a bad month', async () => {
      assert.equal((await get('/summary?month=2026-00')).status, 400);
    });

    test('monthly rejects bad spans', async () => {
      assert.equal((await get('/monthly?from=2026-13')).status, 400);
      assert.equal((await get('/monthly?from=2026-11&to=2026-09')).status, 400);
    });
  });
}
