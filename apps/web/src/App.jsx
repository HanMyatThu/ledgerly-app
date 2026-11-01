import { useEffect, useState } from 'react';
import { api } from './api.js';
import Header from './components/Header.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listTransactions().then(setTransactions).catch((err) => setError(err.message));
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
    <div className="app">
      <Header />
      <main>
        {error && <p className="error">{error}</p>}
        <SummaryCards transactions={transactions} />
        <TransactionForm onSubmit={handleCreate} />
        <TransactionList transactions={transactions} onDelete={handleDelete} />
      </main>
    </div>
  );
}
