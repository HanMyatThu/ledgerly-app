import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

// Loads the recurring rules and keeps them fresh after changes.
export function useRecurring() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    try {
      setRules(await api.listRecurring());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { rules, loading, error, reload };
}
