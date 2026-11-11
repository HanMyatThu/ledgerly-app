import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api.js';

// Loads transactions for a query (filters as API query params) and keeps
// them fresh after creates and deletes. With `pageSize`, it loads one page
// at a time and `loadMore` appends the next.
export function useTransactions(query = {}, { pageSize } = {}) {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const key = JSON.stringify(query);
  // Ignore responses from a query that has since changed.
  const latest = useRef(0);

  const fetchPage = useCallback(
    async (offset) => {
      const params = { ...JSON.parse(key) };
      if (pageSize) Object.assign(params, { limit: pageSize, offset: offset || undefined });
      return api.listTransactionsPage(params);
    },
    [key, pageSize],
  );

  const reload = useCallback(async () => {
    const call = ++latest.current;
    setLoading(true);
    try {
      const page = await fetchPage(0);
      if (call !== latest.current) return;
      setTransactions(page.items);
      setTotal(page.total);
      setError(null);
    } catch (err) {
      if (call === latest.current) setError(err.message);
    } finally {
      if (call === latest.current) setLoading(false);
    }
  }, [fetchPage]);

  useEffect(() => {
    reload();
  }, [reload]);

  const loadMore = useCallback(async () => {
    const call = latest.current;
    setLoading(true);
    try {
      const page = await fetchPage(transactions.length);
      if (call !== latest.current) return;
      setTransactions((items) => [...items, ...page.items]);
      setTotal(page.total);
    } catch (err) {
      setError(err.message);
    } finally {
      if (call === latest.current) setLoading(false);
    }
  }, [fetchPage, transactions.length]);

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

  return {
    transactions,
    total,
    hasMore: transactions.length < total,
    loading,
    error,
    clearError: () => setError(null),
    reload,
    loadMore,
    create,
    remove,
  };
}
