import express from 'express';
import cors from 'cors';
import { CATEGORIES } from '@ledgerly/shared';
import { createTransactionStore } from './store/transactions.js';
import { transactionsRouter } from './routes/transactions.js';
import { requestLogger } from './middleware/requestLogger.js';

export function createApp({ store = createTransactionStore(), logRequests = false } = {}) {
  const app = express();

  if (logRequests) app.use(requestLogger());
  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/api/categories', (req, res) => {
    res.json(CATEGORIES);
  });

  app.use('/api/transactions', transactionsRouter(store));

  app.use((req, res) => {
    res.status(404).json({ error: 'Not found' });
  });

  return app;
}
