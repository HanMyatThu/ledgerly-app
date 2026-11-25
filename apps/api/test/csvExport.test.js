import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv } from '@ledgerly/shared';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store/index.js';

describe('GET /api/transactions/export.csv', () => {
  let server;
  let db;
  let base;

  before(async () => {
    const created = createStore({ store: 'sqlite', databasePath: ':memory:' });
    db = created.db;
    created.store.create({
      type: 'expense',
      amountCents: 899,
      categoryId: 'dining',
      date: '2026-11-02',
      note: 'Lunch, "big"',
    });
    created.store.create({ type: 'income', amountCents: 250000, categoryId: 'salary', date: '2026-11-01' });
    created.store.create({
      type: 'expense',
      amountCents: 1200,
      categoryId: 'transport',
      date: '2026-10-30',
      note: '=1+1',
    });
    server = createApp({ store: created.store }).listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://localhost:${server.address().port}/api/transactions/export.csv`;
  });

  after(() => {
    server.close();
    db?.close();
  });

  test('downloads every transaction as CSV, newest first', async () => {
    const res = await fetch(base);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/csv/);
    assert.match(res.headers.get('content-disposition'), /attachment; filename="ledgerly-transactions.csv"/);
    const rows = parseCsv(await res.text());
    assert.deepEqual(rows[0], ['date', 'type', 'category', 'amount', 'note']);
    assert.deepEqual(rows.slice(1), [
      ['2026-11-02', 'expense', 'dining', '8.99', 'Lunch, "big"'],
      ['2026-11-01', 'income', 'salary', '2500.00', ''],
      ['2026-10-30', 'expense', 'transport', '12.00', "'=1+1"],
    ]);
  });

  test('applies the list filters', async () => {
    const rows = parseCsv(await (await fetch(`${base}?from=2026-11-01&type=expense`)).text());
    assert.equal(rows.length, 2);
    assert.equal(rows[1][2], 'dining');
  });

  test('ignores paging so the whole match is exported', async () => {
    const rows = parseCsv(await (await fetch(`${base}?limit=1&offset=1`)).text());
    assert.equal(rows.length, 4);
  });

  test('returns only the header when nothing matches', async () => {
    const text = await (await fetch(`${base}?from=2030-01-01`)).text();
    assert.equal(text, 'date,type,category,amount,note\r\n');
  });
});
