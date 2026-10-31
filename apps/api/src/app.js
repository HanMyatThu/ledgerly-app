import express from 'express';
import cors from 'cors';
import { createTransactionStore } from './store/transactions.js';
import { transactionsRouter } from './routes/transactions.js';

export function createApp({ store = createTransactionStore() } = {}) {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/api/transactions', transactionsRouter(store));

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
