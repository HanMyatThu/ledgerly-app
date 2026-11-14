import { createApp } from './app.js';
import { config } from './config.js';
import { createStore } from './store/index.js';

const { store, budgets, db } = createStore(config);

const server = createApp({ store, budgets, db, logRequests: config.logLevel !== 'silent' }).listen(config.port, () => {
  console.log(`Ledgerly API listening on http://localhost:${config.port} (${config.store} store)`);
});

let shuttingDown = false;

// Stop taking new requests, let in-flight ones finish, then close the database.
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received, shutting down`);

  const force = setTimeout(() => {
    console.error('Forcing shutdown after 10s');
    process.exit(1);
  }, 10_000);
  force.unref();

  server.close(() => {
    db?.close();
    console.log('Shutdown complete');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
