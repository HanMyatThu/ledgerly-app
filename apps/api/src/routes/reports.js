import { Router } from 'express';
import { HttpError, asyncHandler } from '../http.js';
import { MONTH, currentMonth, monthRange, monthsBetween, shiftMonth } from '../lib/months.js';
import { averageDailySpend, percentChange } from '../lib/summary.js';

// Reads ?from=YYYY-MM&to=YYYY-MM, defaulting to the six months ending this month.
function monthSpan(query) {
  const to = query.to ?? currentMonth();
  const from = query.from ?? shiftMonth(to, -5);
  if (!MONTH.test(from) || !MONTH.test(to)) throw new HttpError(400, 'Months must be in YYYY-MM format');
  if (from > to) throw new HttpError(400, '"from" must not be after "to"');
  return { from, to };
}

// Reads ?month=YYYY-MM (default this month) and ?type=income|expense (default expense).
function monthAndType(query) {
  const month = query.month ?? currentMonth();
  if (!MONTH.test(month)) throw new HttpError(400, 'Month must be in YYYY-MM format');
  const type = query.type ?? 'expense';
  if (type !== 'income' && type !== 'expense') throw new HttpError(400, 'Type must be "income" or "expense"');
  return { month, type };
}

// Adds each category's share of the total, as a whole percent.
function withShare(rows) {
  const total = rows.reduce((sum, row) => sum + row.totalCents, 0);
  return rows.map((row) => ({ ...row, percent: total ? Math.round((row.totalCents / total) * 100) : 0 }));
}

// `today` is injectable so tests do not depend on the real date.
export function reportsRouter(store, { today = () => new Date().toISOString().slice(0, 10) } = {}) {
  const router = Router();

  // GET /api/reports/monthly?from=2026-06&to=2026-11
  // One entry per month, including months with no transactions.
  router.get(
    '/monthly',
    asyncHandler((req, res) => {
      const { from, to } = monthSpan(req.query);
      const totals = new Map(
        store.monthlyTotals({ from: monthRange(from).from, to: monthRange(to).to }).map((row) => [row.month, row]),
      );
      res.json(
        monthsBetween(from, to).map((month) => {
          const { incomeCents = 0, expenseCents = 0 } = totals.get(month) ?? {};
          return { month, incomeCents, expenseCents, netCents: incomeCents - expenseCents };
        }),
      );
    }),
  );

  // GET /api/reports/categories?month=2026-11&type=expense
  router.get(
    '/categories',
    asyncHandler((req, res) => {
      const { month, type } = monthAndType(req.query);
      res.json(withShare(store.categoryTotals({ ...monthRange(month), type })));
    }),
  );

  // GET /api/reports/top?month=2026-11&limit=5
  // The categories with the most spending in a month.
  router.get(
    '/top',
    asyncHandler((req, res) => {
      const { month } = monthAndType({ month: req.query.month });
      const limit = Number(req.query.limit ?? 5);
      if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
        throw new HttpError(400, 'Limit must be a whole number from 1 to 20');
      }
      // Share is of all spending in the month, not just the top few.
      const all = withShare(store.categoryTotals({ ...monthRange(month), type: 'expense' }));
      res.json(all.slice(0, limit));
    }),
  );

  // GET /api/reports/summary?month=2026-11
  // Income, expenses and balance for one month.
  router.get(
    '/summary',
    asyncHandler((req, res) => {
      const { month } = monthAndType({ month: req.query.month });
      const range = monthRange(month);
      const totals = (m) => {
        const [row] = store.monthlyTotals(monthRange(m));
        return { incomeCents: row?.incomeCents ?? 0, expenseCents: row?.expenseCents ?? 0 };
      };
      const { incomeCents, expenseCents } = totals(month);
      const previous = totals(shiftMonth(month, -1));
      res.json({
        month,
        incomeCents,
        expenseCents,
        balanceCents: incomeCents - expenseCents,
        count: store.count(range),
        averageDailySpendCents: averageDailySpend(expenseCents, month, today()),
        // Compared with the month before; percents are null when last month was zero.
        previous: {
          month: shiftMonth(month, -1),
          ...previous,
          incomeChangePercent: percentChange(incomeCents, previous.incomeCents),
          expenseChangePercent: percentChange(expenseCents, previous.expenseCents),
        },
      });
    }),
  );

  return router;
}
