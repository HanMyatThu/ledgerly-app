import { useEffect, useState } from 'react';
import { api } from './api.js';
import TransactionList from './components/TransactionList.jsx';

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.listTransactions().then(setTransactions).catch((err) => setError(err.message));
  }, []);

  async function handleDelete(id) {
    await api.deleteTransaction(id);
    setTransactions((items) => items.filter((tx) => tx.id !== id));
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Ledgerly</h1>
        <p>Track what you spend and earn.</p>
      </header>
      <main>
        {error && <p className="error">{error}</p>}
        <TransactionList transactions={transactions} onDelete={handleDelete} />
      </main>
    </div>
  );
}
