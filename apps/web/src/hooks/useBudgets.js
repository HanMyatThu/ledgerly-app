import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

// Loads budget progress for a month and exposes actions that refresh it.
export function useBudgets(month) {
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setProgress(await api.budgetProgress(month));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    reload();
  }, [reload]);

  const setBudget = useCallback(
    async (categoryId, amountCents) => {
      await api.setBudget(month, categoryId, amountCents);
      await reload();
    },
    [month, reload],
  );

  const removeBudget = useCallback(
    async (categoryId) => {
      await api.removeBudget(month, categoryId);
      await reload();
    },
    [month, reload],
  );

  // Resolves to the number of budgets copied.
  const copyPrevious = useCallback(async () => {
    const { copied } = await api.copyPreviousBudgets(month);
    await reload();
    return copied;
  }, [month, reload]);

  return { progress, loading, error, clearError: () => setError(null), reload, setBudget, removeBudget, copyPrevious };
}
