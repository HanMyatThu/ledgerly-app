import { useEffect, useState } from 'react';
import { formatMoney, getCategory } from '@ledgerly/shared';
import { api } from '../api.js';

// Returns a warning when adding `amountCents` to an expense category would push
// it past that month's budget. `previous` is the transaction being edited, so
// its old amount is not counted twice.
export function useBudgetWarning({ type, categoryId, date, amountCents }, previous) {
  const month = typeof date === 'string' ? date.slice(0, 7) : '';
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    if (type !== 'expense' || !/^\d{4}-\d{2}$/.test(month)) {
      setProgress(null);
      return undefined;
    }
    let cancelled = false;
    api
      .budgetProgress(month)
      .then((items) => !cancelled && setProgress({ month, items }))
      .catch(() => !cancelled && setProgress(null));
    return () => {
      cancelled = true;
    };
  }, [type, month]);

  if (type !== 'expense' || !progress || progress.month !== month) return null;
  if (!Number.isFinite(amountCents) || amountCents <= 0) return null;

  const budget = progress.items.find((item) => item.categoryId === categoryId);
  if (!budget) return null;

  const alreadyCounted =
    previous && previous.type === 'expense' && previous.categoryId === categoryId && previous.date.startsWith(month)
      ? previous.amountCents
      : 0;
  const after = budget.spentCents - alreadyCounted + amountCents;
  if (after <= budget.budgetCents) return null;

  const label = getCategory(categoryId)?.label ?? categoryId;
  return `This puts ${label} ${formatMoney(after - budget.budgetCents)} over its ${formatMoney(budget.budgetCents)} budget.`;
}
