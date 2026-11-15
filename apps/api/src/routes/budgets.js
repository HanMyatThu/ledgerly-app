import { Router } from 'express';
import { validateBudget } from '@ledgerly/shared';
import { HttpError, asyncHandler, notFound } from '../http.js';

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/;

function monthParam(value) {
  if (typeof value !== 'string' || !MONTH.test(value)) {
    throw new HttpError(400, 'Month must be in YYYY-MM format', { month: 'Month must be in YYYY-MM format' });
  }
  return value;
}

function monthRange(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return { from: `${month}-01`, to: `${month}-${String(lastDay).padStart(2, '0')}` };
}

function previousMonth(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const date = new Date(Date.UTC(year, monthNumber - 2, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

// Combines a month's budgets with what was spent in each category.
export function budgetProgress(budgetList, spent) {
  return budgetList.map((budget) => {
    const spentCents = spent[budget.categoryId] ?? 0;
    return {
      categoryId: budget.categoryId,
      budgetCents: budget.amountCents,
      spentCents,
      remainingCents: budget.amountCents - spentCents,
      percent: Math.round((spentCents / budget.amountCents) * 100),
      over: spentCents > budget.amountCents,
    };
  });
}

export function budgetsRouter(budgets, transactions) {
  const router = Router();

  // GET /api/budgets?month=2026-11
  router.get(
    '/',
    asyncHandler((req, res) => {
      res.json(budgets.list(monthParam(req.query.month)));
    }),
  );

  // GET /api/budgets/progress?month=2026-11
  router.get(
    '/progress',
    asyncHandler((req, res) => {
      const month = monthParam(req.query.month);
      const spent = transactions.spentByCategory(monthRange(month));
      res.json(budgetProgress(budgets.list(month), spent));
    }),
  );

  // POST /api/budgets/2026-11/copy-previous
  // Copies October's budgets into November, skipping categories November already has.
  router.post(
    '/:month/copy-previous',
    asyncHandler((req, res) => {
      const month = monthParam(req.params.month);
      const existing = new Set(budgets.list(month).map((budget) => budget.categoryId));
      const copied = budgets
        .list(previousMonth(month))
        .filter((budget) => !existing.has(budget.categoryId))
        .map((budget) => budgets.upsert({ month, categoryId: budget.categoryId, amountCents: budget.amountCents }));
      res.status(copied.length ? 201 : 200).json({ copied: copied.length, budgets: budgets.list(month) });
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

  // DELETE /api/budgets/2026-11/groceries
  router.delete(
    '/:month/:categoryId',
    asyncHandler((req, res) => {
      if (!budgets.remove(monthParam(req.params.month), req.params.categoryId)) throw notFound('Budget');
      res.status(204).end();
    }),
  );

  return router;
}
