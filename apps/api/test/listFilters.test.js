import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store/index.js';

const FIXTURES = [
  { type: 'expense', amountCents: 1200, categoryId: 'dining', date: '2026-10-30', note: 'Ramen night' },
  { type: 'income', amountCents: 300000, categoryId: 'salary', date: '2026-11-01', note: 'November pay' },
  { type: 'expense', amountCents: 6400, categoryId: 'groceries', date: '2026-11-02', note: 'Weekly shop' },
  { type: 'expense', amountCents: 950, categoryId: 'dining', date: '2026-11-05', note: 'Coffee' },
  { type: 'expense', amountCents: 4500, categoryId: 'transport', date: '2026-11-10', note: 'Transit pass' },
  { type: 'expense', amountCents: 2000, categoryId: 'shopping', date: '2026-11-11', note: '50% off sale' },
];

const STORES = {
  memory: { store: 'memory' },
  sqlite: { store: 'sqlite', databasePath: ':memory:' },
};

for (const [name, config] of Object.entries(STORES)) {
  describe(`list filters with the ${name} store`, () => {
    let server;
    let db;
    let base;

    before(async () => {
      const created = createStore(config);
      db = created.db;
      for (const item of FIXTURES) created.store.create(item);
      server = createApp({ store: created.store }).listen(0);
      await new Promise((resolve) => server.once('listening', resolve));
      base = `http://localhost:${server.address().port}/api/transactions`;
    });

    after(() => {
      server.close();
      db?.close();
    });

    async function dates(query) {
      const items = await (await fetch(`${base}?${query}`)).json();
      return items.map((item) => item.date);
    }

    test('from keeps transactions on or after the date', async () => {
      assert.deepEqual(await dates('from=2026-11-02'), ['2026-11-11', '2026-11-10', '2026-11-05', '2026-11-02']);
    });

    test('to keeps transactions on or before the date', async () => {
      assert.deepEqual(await dates('to=2026-11-01'), ['2026-11-01', '2026-10-30']);
    });

    test('from and to together select a range', async () => {
      assert.deepEqual(await dates('from=2026-11-01&to=2026-11-05'), ['2026-11-05', '2026-11-02', '2026-11-01']);
    });

    test('type keeps only income or only expenses', async () => {
      assert.deepEqual(await dates('type=income'), ['2026-11-01']);
      assert.equal((await dates('type=expense')).length, 5);
    });

    test('an unknown type is ignored', async () => {
      assert.equal((await dates('type=gift')).length, FIXTURES.length);
    });

    test('category keeps one category', async () => {
      assert.deepEqual(await dates('category=dining'), ['2026-11-05', '2026-10-30']);
    });

    test('filters combine', async () => {
      assert.deepEqual(await dates('category=dining&from=2026-11-01'), ['2026-11-05']);
      assert.deepEqual(await dates('type=income&category=dining'), []);
    });

    test('q searches notes without caring about case', async () => {
      assert.deepEqual(await dates('q=WEEKLY'), ['2026-11-02']);
      assert.deepEqual(await dates('q=pa'), ['2026-11-10', '2026-11-01']);
    });

    test('q treats % and _ literally', async () => {
      assert.deepEqual(await dates('q=' + encodeURIComponent('50%')), ['2026-11-11']);
      assert.deepEqual(await dates('q=_'), []);
    });

    test('a blank q is ignored', async () => {
      assert.equal((await dates('q=%20%20')).length, FIXTURES.length);
    });

    test('limit and offset page through results newest first', async () => {
      assert.deepEqual(await dates('limit=2'), ['2026-11-11', '2026-11-10']);
      assert.deepEqual(await dates('limit=2&offset=2'), ['2026-11-05', '2026-11-02']);
      assert.deepEqual(await dates('limit=2&offset=6'), []);
    });

    test('offset without limit returns the rest', async () => {
      assert.equal((await dates('offset=4')).length, FIXTURES.length - 4);
    });

    test('X-Total-Count counts matches before paging', async () => {
      const res = await fetch(`${base}?type=expense&limit=1`);
      assert.equal(res.headers.get('x-total-count'), '5');
      assert.equal((await res.json()).length, 1);
    });

    test('invalid paging values are ignored', async () => {
      assert.equal((await dates('limit=-3&offset=abc')).length, FIXTURES.length);
    });

    test('malformed dates are ignored', async () => {
      assert.equal((await dates('from=yesterday')).length, FIXTURES.length);
    });
  });
}
