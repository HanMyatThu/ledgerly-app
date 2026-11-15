import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { budgetProgress } from '../src/routes/budgets.js';
import { createStore } from '../src/store/index.js';

test('budgetProgress computes remaining, percent and over', () => {
  const result = budgetProgress(
    [
      { categoryId: 'dining', amountCents: 10000 },
      { categoryId: 'groceries', amountCents: 20000 },
      { categoryId: 'transport', amountCents: 5000 },
    ],
    { dining: 12500, groceries: 5000 },
  );
  assert.deepEqual(result, [
    { categoryId: 'dining', budgetCents: 10000, spentCents: 12500, remainingCents: -2500, percent: 125, over: true },
    { categoryId: 'groceries', budgetCents: 20000, spentCents: 5000, remainingCents: 15000, percent: 25, over: false },
    { categoryId: 'transport', budgetCents: 5000, spentCents: 0, remainingCents: 5000, percent: 0, over: false },
  ]);
});

let server;
let db;
let base;

before(async () => {
  const created = createStore({ store: 'sqlite', databasePath: ':memory:' });
  db = created.db;
  const tx = (categoryId, amountCents, date, type = 'expense') =>
    created.store.create({ type, categoryId, amountCents, date });
  tx('dining', 4000, '2026-11-03');
  tx('dining', 2500, '2026-11-30');
  tx('dining', 9999, '2026-10-31'); // previous month
  tx('dining', 9999, '2026-12-01'); // next month
  tx('groceries', 8000, '2026-11-10');
  tx('salary', 300000, '2026-11-01', 'income');
  created.budgets.upsert({ month: '2026-11', categoryId: 'dining', amountCents: 6000 });
  created.budgets.upsert({ month: '2026-11', categoryId: 'transport', amountCents: 5000 });
  server = createApp(created).listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  base = `http://localhost:${server.address().port}/api/budgets`;
});

after(() => {
  server.close();
  db.close();
});

test('GET /progress counts only that month and only budgeted categories', async () => {
  const progress = await (await fetch(`${base}/progress?month=2026-11`)).json();
  assert.deepEqual(
    progress.map(({ categoryId, spentCents, over }) => ({ categoryId, spentCents, over })),
    [
      { categoryId: 'dining', spentCents: 6500, over: true },
      { categoryId: 'transport', spentCents: 0, over: false },
    ],
  );
});

test('GET /progress for a month without budgets is empty', async () => {
  assert.deepEqual(await (await fetch(`${base}/progress?month=2026-09`)).json(), []);
});

test('GET /progress requires a valid month', async () => {
  assert.equal((await fetch(`${base}/progress?month=nope`)).status, 400);
});
