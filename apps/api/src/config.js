import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

function toPort(value, fallback) {
  const port = Number(value);
  return Number.isInteger(port) && port > 0 ? port : fallback;
}

export function loadConfig(env = process.env) {
  return {
    port: toPort(env.PORT, 4000),
    store: env.STORE === 'memory' ? 'memory' : 'sqlite',
    databasePath: env.DATABASE_PATH
      ? path.resolve(env.DATABASE_PATH)
      : path.join(apiRoot, 'data', 'ledgerly.db'),
    logLevel: env.LOG_LEVEL ?? 'info',
  };
}

export const config = loadConfig();
