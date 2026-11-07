import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createStore } from '../src/store/index.js';

async function getHealth(app) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  try {
    const res = await fetch(`http://localhost:${server.address().port}/api/health`);
    return { status: res.status, body: await res.json() };
  } finally {
    server.close();
  }
}

test('reports ok without a database for the memory store', async () => {
  const { status, body } = await getHealth(createApp());
  assert.equal(status, 200);
  assert.equal(body.status, 'ok');
  assert.equal(body.database, 'not used');
  assert.equal(typeof body.uptime, 'number');
});

test('reports ok with an open database', async () => {
  const { store, db } = createStore({ store: 'sqlite', databasePath: ':memory:' });
  const { status, body } = await getHealth(createApp({ store, db }));
  db.close();
  assert.equal(status, 200);
  assert.equal(body.database, 'ok');
});

test('reports degraded with a closed database', async () => {
  const { store, db } = createStore({ store: 'sqlite', databasePath: ':memory:' });
  db.close();
  const { status, body } = await getHealth(createApp({ store, db }));
  assert.equal(status, 503);
  assert.equal(body.status, 'degraded');
  assert.equal(body.database, 'error');
});
