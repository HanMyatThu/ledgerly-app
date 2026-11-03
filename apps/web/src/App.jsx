import { useEffect, useState } from 'react';
import { api } from './api.js';
import Layout from './components/Layout.jsx';
import Spinner from './components/Spinner.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .listTransactions()
      .then(setTransactions)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleCreate(data) {
    const created = await api.createTransaction(data);
    setTransactions((items) => [created, ...items].sort((a, b) => b.date.localeCompare(a.date)));
  }

  async function handleDelete(id) {
    await api.deleteTransaction(id);
    setTransactions((items) => items.filter((tx) => tx.id !== id));
  }

  return (
    <Layout>
      {error && <p className="error">{error}</p>}
      <SummaryCards transactions={transactions} />
      <TransactionForm onSubmit={handleCreate} />
      {loading ? (
        <Spinner label="Loading transactions…" />
      ) : (
        <TransactionList transactions={transactions} onDelete={handleDelete} />
      )}
    </Layout>
  );
}
