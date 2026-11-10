import { useMemo, useState } from 'react';
import Alert from './components/Alert.jsx';
import FilterBar from './components/FilterBar.jsx';
import Layout from './components/Layout.jsx';
import MonthPicker from './components/MonthPicker.jsx';
import Spinner from './components/Spinner.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';
import { useTransactions } from './hooks/useTransactions.js';
import { currentMonth, formatMonth, monthRange } from './lib/month.js';

export default function App() {
  const [month, setMonth] = useState(currentMonth);
  const [filters, setFilters] = useState({});
  const range = useMemo(() => monthRange(month), [month]);
  const listQuery = useMemo(() => ({ ...range, ...filters }), [range, filters]);

  // The summary always covers the whole month; the list follows the filters too.
  const monthly = useTransactions(range);
  const list = useTransactions(listQuery);

  async function handleCreate(data) {
    await list.create(data);
    await monthly.reload();
  }

  async function handleDelete(id) {
    await list.remove(id);
    await monthly.reload();
  }

  const error = list.error ?? monthly.error;

  return (
    <Layout>
      {error && (
        <Alert
          title="Could not load transactions"
          onDismiss={() => {
            list.clearError();
            monthly.clearError();
          }}
        >
          {error}
        </Alert>
      )}
      <MonthPicker value={month} onChange={setMonth} />
      <SummaryCards transactions={monthly.transactions} label={`Totals for ${formatMonth(month)}`} />
      <TransactionForm onSubmit={handleCreate} />
      <FilterBar filters={filters} onChange={setFilters} />
      {list.loading && !list.transactions.length ? (
        <Spinner label="Loading transactions…" />
      ) : (
        <TransactionList transactions={list.transactions} onDelete={handleDelete} />
      )}
    </Layout>
  );
}
