import { createApp } from './app.js';
import { config } from './config.js';
import { createStore } from './store/index.js';

const { store } = createStore(config);

createApp({ store, logRequests: config.logLevel !== 'silent' }).listen(config.port, () => {
  console.log(`Ledgerly API listening on http://localhost:${config.port} (${config.store} store)`);
});
