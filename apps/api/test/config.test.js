import { test } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { loadConfig } from '../src/config.js';

test('uses defaults when env is empty', () => {
  const config = loadConfig({});
  assert.equal(config.port, 4000);
  assert.equal(config.store, 'sqlite');
  assert.ok(config.databasePath.endsWith(path.join('data', 'ledgerly.db')));
});

test('reads values from env', () => {
  const config = loadConfig({ PORT: '5050', STORE: 'memory', DATABASE_PATH: 'tmp/test.db' });
  assert.equal(config.port, 5050);
  assert.equal(config.store, 'memory');
  assert.equal(config.databasePath, path.resolve('tmp/test.db'));
});

test('falls back on an invalid port', () => {
  assert.equal(loadConfig({ PORT: 'abc' }).port, 4000);
});
