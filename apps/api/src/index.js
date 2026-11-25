import { createApp } from './app.js';
import { config } from './config.js';
import { createStore } from './store/index.js';
import { materializeRecurring } from './lib/materialize.js';
import { localToday } from './lib/today.js';
import { runDaily } from './lib/daily.js';

const { store, budgets, recurring, db } = createStore(config);

// Catch up on recurring transactions that fell due while the server was down.
function runMaterializer() {
  try {
    const created = materializeRecurring({ recurring, store, today: localToday() });
    if (created.length) console.log(`Added ${created.length} recurring transactions`);
  } catch (err) {
    console.error('Recurring transactions failed:', err);
  }
}

runMaterializer();
// And keep adding them each day while it runs.
const stopDaily = runDaily(runMaterializer);

const server = createApp({ store, budgets, recurring, db, logRequests: config.logLevel !== 'silent' }).listen(
  config.port,
  () => {
    console.log(`Ledgerly API listening on http://localhost:${config.port} (${config.store} store)`);
  },
);

let shuttingDown = false;

// Stop taking new requests, let in-flight ones finish, then close the database.
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  stopDaily();
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
