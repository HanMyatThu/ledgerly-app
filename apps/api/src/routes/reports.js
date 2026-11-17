import { Router } from 'express';
import { HttpError, asyncHandler } from '../http.js';
import { MONTH, currentMonth, monthRange, monthsBetween, shiftMonth } from '../lib/months.js';

// Reads ?from=YYYY-MM&to=YYYY-MM, defaulting to the six months ending this month.
function monthSpan(query) {
  const to = query.to ?? currentMonth();
  const from = query.from ?? shiftMonth(to, -5);
  if (!MONTH.test(from) || !MONTH.test(to)) throw new HttpError(400, 'Months must be in YYYY-MM format');
  if (from > to) throw new HttpError(400, '"from" must not be after "to"');
  return { from, to };
}

export function reportsRouter(store) {
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

  return router;
}
