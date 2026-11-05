import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { openDatabase } from '../src/db/connection.js';
import { appliedMigrations, runMigrations } from '../src/db/migrate.js';
import { migrations } from '../src/db/migrations/index.js';

function tempDatabase(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ledgerly-'));
  const db = openDatabase(path.join(dir, 'nested', 'test.db'));
  t.after(() => {
    db.close();
    fs.rmSync(dir, { recursive: true, force: true });
  });
  return db;
}

test('applies every migration on a fresh database', (t) => {
  const db = tempDatabase(t);
  const applied = runMigrations(db, migrations);
  assert.deepEqual(applied, migrations.map((m) => m.name));
  assert.deepEqual(appliedMigrations(db), applied);

  const table = db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'transactions'").get();
  assert.equal(table?.name, 'transactions');
});

test('running again applies nothing', (t) => {
  const db = tempDatabase(t);
  runMigrations(db, migrations);
  assert.deepEqual(runMigrations(db, migrations), []);
});

test('only new migrations run', (t) => {
  const db = tempDatabase(t);
  runMigrations(db, migrations);
  const extra = { name: '999-extra', up: (d) => d.exec('CREATE TABLE extra (id INTEGER)') };
  assert.deepEqual(runMigrations(db, [...migrations, extra]), ['999-extra']);
});

test('a failing migration is rolled back and not recorded', (t) => {
  const db = tempDatabase(t);
  const broken = {
    name: '001-broken',
    up: (d) => {
      d.exec('CREATE TABLE half_done (id INTEGER)');
      throw new Error('boom');
    },
  };
  assert.throws(() => runMigrations(db, [broken]), /boom/);
  assert.deepEqual(appliedMigrations(db), []);
  const table = db.prepare("SELECT name FROM sqlite_master WHERE name = 'half_done'").get();
  assert.equal(table, undefined);
});
