import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { shiftMonth } from '../lib/month.js';

const EMPTY = { summary: null, monthly: [], categories: [], top: [] };

// Loads everything the Reports page shows for a month in parallel:
// the summary, six months of totals ending at `month`, and category breakdowns.
export function useReports(month) {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      api.reportSummary(month),
      api.reportMonthly(shiftMonth(month, -5), month),
      api.reportCategories(month),
      api.reportTop(month, 5),
    ])
      .then(([summary, monthly, categories, top]) => {
        if (cancelled) return;
        setData({ summary, monthly, categories, top });
        setError(null);
      })
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [month]);

  return { ...data, loading, error };
}
