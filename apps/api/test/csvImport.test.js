import { describe, test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store/index.js';

const HEADER = 'date,type,category,amount,note';

describe('POST /api/transactions/import', () => {
  let server;
  let db;
  let base;

  beforeEach(async () => {
    const created = createStore({ store: 'sqlite', databasePath: ':memory:' });
    db = created.db;
    server = createApp({ store: created.store }).listen(0);
    await new Promise((resolve) => server.once('listening', resolve));
    base = `http://localhost:${server.address().port}/api/transactions`;
  });

  afterEach(() => {
    server.close();
    db?.close();
  });

  const send = (body, type = 'text/csv') =>
    fetch(`${base}/import`, { method: 'POST', headers: { 'Content-Type': type }, body });

  test('saves every valid row', async () => {
    const res = await send(`${HEADER}\n2026-11-03,expense,dining,8.99,Lunch\n2026-11-01,income,salary,2500,\n`);
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.accepted.length, 2);
    assert.deepEqual(body.rejected, []);
    assert.equal(body.accepted[0].amountCents, 899);
    const list = await (await fetch(base)).json();
    assert.equal(list.length, 2);
  });

  test('skips invalid rows and explains each by line and column', async () => {
    const csv = [
      HEADER,
      '2026-11-03,expense,dining,8.99,ok',
      'not-a-date,expense,dining,1,',
      '2026-11-03,expense,salary,abc,',
      '2026-11-03,expense,dining,0,',
    ].join('\n');
    const body = await (await send(csv)).json();
    assert.equal(body.accepted.length, 1);
    assert.deepEqual(
      body.rejected.map((row) => [row.line, Object.keys(row.errors).sort()]),
      [
        [3, ['date']],
        [4, ['amount', 'category']],
        [5, ['amount']],
      ],
    );
    assert.equal(body.rejected[1].errors.amount, 'Amount must be a number like 12.50');
    assert.equal(body.rejected[2].errors.amount, 'Amount must be more than zero');
  });

  test('answers 200 when no row could be saved', async () => {
    const res = await send(`${HEADER}\n2026-11-03,expense,nope,1,\n`);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).accepted.length, 0);
  });

  test('accepts columns in any order and case, and ignores extra ones', async () => {
    const body = await (await send('Amount,Category,Extra,Type,Date\n12.50,Groceries,x,Expense,2026-11-04\n')).json();
    assert.equal(body.accepted.length, 1);
    assert.equal(body.accepted[0].categoryId, 'groceries');
    assert.equal(body.accepted[0].amountCents, 1250);
  });

  test('reads back a file from the export endpoint', async () => {
    await send(`${HEADER}\n2026-11-03,expense,dining,8.99,"Tea, ""green"""\n2026-11-02,expense,shopping,5,=1+1\n`);
    const exported = await (await fetch(`${base}/export.csv`)).text();
    const body = await (await send(exported)).json();
    assert.equal(body.accepted.length, 2);
    assert.deepEqual(
      body.accepted.map((item) => item.note),
      ['Tea, "green"', '=1+1'],
    );
  });

  test('rejects a file missing required columns', async () => {
    const res = await send('date,amount\n2026-11-03,1\n');
    assert.equal(res.status, 400);
    assert.match((await res.json()).error, /missing columns: type, category/);
  });

  test('rejects an empty body or a JSON body', async () => {
    assert.equal((await send('')).status, 400);
    assert.equal((await send('{"a":1}', 'application/json')).status, 400);
  });

  test('rejects a malformed file', async () => {
    const res = await send(`${HEADER}\n2026-11-03,expense,dining,"1,\n`);
    assert.equal(res.status, 400);
  });
});
