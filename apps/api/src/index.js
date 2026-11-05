import { createApp } from './app.js';
import { config } from './config.js';

const { port } = config;

createApp().listen(port, () => {
  console.log(`Ledgerly API listening on http://localhost:${port}`);
});
