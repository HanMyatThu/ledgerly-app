import { createApp } from './app.js';
import { config } from './config.js';
import { setupDatabase } from './db/index.js';

const { port } = config;

if (config.store === 'sqlite') {
  setupDatabase(config.databasePath);
}

createApp().listen(port, () => {
  console.log(`Ledgerly API listening on http://localhost:${port}`);
});
