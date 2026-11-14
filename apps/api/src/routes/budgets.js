import { Router } from 'express';
import { validateBudget } from '@ledgerly/shared';
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

  // PUT /api/budgets/2026-11/groceries  { "amountCents": 40000 }
  // Creates the budget or replaces its amount.
  router.put(
    '/:month/:categoryId',
    asyncHandler((req, res) => {
      const data = {
        month: req.params.month,
        categoryId: req.params.categoryId,
        amountCents: req.body?.amountCents,
      };
      const errors = validateBudget(data);
      if (Object.keys(errors).length) throw new HttpError(400, 'Invalid budget', errors);
      const existed = Boolean(budgets.get(data.month, data.categoryId));
      res.status(existed ? 200 : 201).json(budgets.upsert(data));
    }),
  );

  return router;
}
