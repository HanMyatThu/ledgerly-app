import Alert from './components/Alert.jsx';
import Layout from './components/Layout.jsx';
import Spinner from './components/Spinner.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';
import { useTransactions } from './hooks/useTransactions.js';

export default function App() {
  const { transactions, loading, error, clearError, create, remove } = useTransactions();

  return (
    <Layout>
      {error && (
        <Alert title="Could not load transactions" onDismiss={clearError}>
          {error}
        </Alert>
      )}
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
