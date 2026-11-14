import { Router } from 'express';
import { HttpError, asyncHandler } from '../http.js';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

function monthParam(value) {
  if (typeof value !== 'string' || !MONTH.test(value)) {
    throw new HttpError(400, 'Month must be in YYYY-MM format', { month: 'Month must be in YYYY-MM format' });
  }
  return value;
}

export function budgetsRouter(budgets) {
  const router = Router();

  // GET /api/budgets?month=2026-11
  router.get(
    '/',
    asyncHandler((req, res) => {
      res.json(budgets.list(monthParam(req.query.month)));
    }),
  );

  return router;
}
