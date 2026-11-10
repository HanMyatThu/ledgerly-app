import { useMemo, useState } from 'react';
import Alert from './components/Alert.jsx';
import Layout from './components/Layout.jsx';
import MonthPicker from './components/MonthPicker.jsx';
import Spinner from './components/Spinner.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';
import { useTransactions } from './hooks/useTransactions.js';
import { currentMonth, monthRange } from './lib/month.js';

export default function App() {
  const [month, setMonth] = useState(currentMonth);
  const query = useMemo(() => monthRange(month), [month]);
  const { transactions, loading, error, clearError, create, remove } = useTransactions(query);

  return (
    <Layout>
      {error && (
        <Alert title="Could not load transactions" onDismiss={clearError}>
          {error}
        </Alert>
      )}
      <MonthPicker value={month} onChange={setMonth} />
      <SummaryCards transactions={transactions} />
      <TransactionForm onSubmit={create} />
      {loading && !transactions.length ? (
        <Spinner label="Loading transactions…" />
      ) : (
        <TransactionList transactions={transactions} onDelete={remove} />
      )}
    </Layout>
  );
}
