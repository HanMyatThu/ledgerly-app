import { useCallback, useEffect, useState } from 'react';
import { api } from '../api.js';

// Loads transactions for a query (filters as API query params) and keeps
// them fresh after creates and deletes.
export function useTransactions(query = {}) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = JSON.stringify(query);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setTransactions(await api.listTransactions(JSON.parse(key)));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    reload();
  }, [reload]);

  const create = useCallback(
    async (data) => {
      await api.createTransaction(data);
      await reload();
    },
    [reload],
  );

  const remove = useCallback(
    async (id) => {
      await api.deleteTransaction(id);
      await reload();
    },
    [reload],
  );

  return { transactions, loading, error, clearError: () => setError(null), reload, create, remove };
}
