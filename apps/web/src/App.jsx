import { useCallback, useEffect, useMemo, useState } from 'react';
import { formatMoney, getCategory } from '@ledgerly/shared';
import Alert from './components/Alert.jsx';
import ConfirmDialog from './components/ConfirmDialog.jsx';
import FilterBar, { hasActiveFilters } from './components/FilterBar.jsx';
import Layout from './components/Layout.jsx';
import LoadMoreButton from './components/LoadMoreButton.jsx';
import Modal from './components/Modal.jsx';
import MonthPicker from './components/MonthPicker.jsx';
import ResultCount from './components/ResultCount.jsx';
import Spinner from './components/Spinner.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import TransactionForm from './components/TransactionForm.jsx';
import TransactionList from './components/TransactionList.jsx';
import { useToast } from './components/ToastProvider.jsx';
import { useTransactions } from './hooks/useTransactions.js';
import { formatDate } from './lib/formatDate.js';
import { formatMonth, monthRange } from './lib/month.js';
import { readUrlState, toUrlSearch } from './lib/urlState.js';

const PAGE_SIZE = 25;

export default function App() {
  const [initial] = useState(() => readUrlState());
  const [month, setMonth] = useState(initial.month);
  const [filters, setFilters] = useState(initial.filters);

  // Mirror month and filters in the address bar so a view can be bookmarked or shared.
  useEffect(() => {
    const search = toUrlSearch({ month, filters });
    if (search !== window.location.search) {
      window.history.replaceState(null, '', `${window.location.pathname}${search}`);
    }
  }, [month, filters]);
  const range = useMemo(() => monthRange(month), [month]);
  const listQuery = useMemo(() => ({ ...range, ...filters }), [range, filters]);

  // The summary always covers the whole month; the list follows the filters too.
  const monthly = useTransactions(range);
  const list = useTransactions(listQuery, { pageSize: PAGE_SIZE });
  const toast = useToast();

  // e.g. "Dining out, $12.50"
  const describe = (tx) => `${getCategory(tx.categoryId)?.label ?? tx.categoryId}, ${formatMoney(tx.amountCents)}`;

  async function handleCreate(data) {
    await list.create(data);
    await monthly.reload();
    toast.show({ message: `Added ${describe(data)}` });
  }

  const [deleting, setDeleting] = useState(null);

  // Undo re-creates the transaction from its saved fields (it gets a new id).
  async function restore(tx) {
    try {
      const { type, amountCents, categoryId, date, note } = tx;
      await list.create({ type, amountCents, categoryId, date, note });
      await monthly.reload();
      toast.show({ message: `Restored ${describe(tx)}` });
    } catch (err) {
      toast.show({ message: `Could not restore: ${err.message}` });
    }
  }

  async function confirmDelete() {
    await list.remove(deleting.id);
    await monthly.reload();
    const removed = deleting;
    toast.show({
      message: `Deleted ${describe(removed)}`,
      actionLabel: 'Undo',
      duration: 8000,
      onAction: () => restore(removed),
    });
    setDeleting(null);
  }

  const [editing, setEditing] = useState(null);
  const closeEditor = useCallback(() => setEditing(null), []);

  // Errors propagate to the form, which shows them and keeps the dialog open.
  async function handleUpdate(data) {
    await list.update(editing.id, data);
    await monthly.reload();
    closeEditor();
    toast.show({ message: 'Changes saved' });
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
        <>
          <ResultCount shown={list.transactions.length} total={list.total} />
          <TransactionList
            transactions={list.transactions}
            onEdit={setEditing}
            onDelete={(id) => setDeleting(list.transactions.find((tx) => tx.id === id) ?? null)}
            filtered={hasActiveFilters(filters)}
            groupByDay={!filters.sort || filters.sort === 'date'}
          />
          <LoadMoreButton
            loaded={list.transactions.length}
            total={list.total}
            loading={list.loading}
            onClick={list.loadMore}
          />
        </>
      )}
      <Modal open={Boolean(editing)} title="Edit transaction" onClose={closeEditor}>
        {editing && <TransactionForm key={editing.id} initial={editing} onSubmit={handleUpdate} />}
      </Modal>
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete transaction?"
        message={
          deleting &&
          `${getCategory(deleting.categoryId)?.label ?? deleting.categoryId}, ${formatMoney(deleting.amountCents)} on ${formatDate(deleting.date)}. This cannot be undone.`
        }
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </Layout>
  );
}
