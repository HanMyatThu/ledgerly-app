import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

const EMPTY = { incomeCents: 0, expenseCents: 0, balanceCents: 0 };

// Loads the month's totals from the summary endpoint.
export function useSummary(month) {
  const [summary, setSummary] = useState(EMPTY);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setSummary(await api.reportSummary(month));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [month]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { summary, error, clearError: () => setError(null), reload };
}
