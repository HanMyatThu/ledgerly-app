import express from 'express';
import cors from 'cors';
import { CATEGORIES } from '@ledgerly/shared';
import { createTransactionStore } from './store/transactions.js';
import { transactionsRouter } from './routes/transactions.js';
import { budgetsRouter } from './routes/budgets.js';
import { createMemoryBudgetStore } from './store/index.js';
import { notFound } from './http.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

function databaseStatus(db) {
  if (!db) return 'not used';
  try {
    db.prepare('SELECT 1').get();
    return 'ok';
  } catch {
    return 'error';
  }
}

export function createApp({
  store = createTransactionStore(),
  budgets = createMemoryBudgetStore(),
  db = null,
  logRequests = false,
} = {}) {
  const app = express();

  if (logRequests) app.use(requestLogger());
  app.use(cors({ exposedHeaders: ['X-Total-Count'] }));
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    const database = databaseStatus(db);
    const healthy = database !== 'error';
    res.status(healthy ? 200 : 503).json({
      status: healthy ? 'ok' : 'degraded',
      database,
      uptime: process.uptime(),
    });
  });

  app.get('/api/categories', (req, res) => {
    res.json(CATEGORIES);
  });

  app.use('/api/transactions', transactionsRouter(store));
  app.use('/api/budgets', budgetsRouter(budgets));

  app.use((req, res, next) => {
    next(notFound('Route'));
  });

  app.use(errorHandler);

  return app;
}
