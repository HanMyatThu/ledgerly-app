import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCategory } from '@ledgerly/shared';
import { api } from '../api.js';
import Alert from '../components/Alert.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import FilterBar, { hasActiveFilters } from '../components/FilterBar.jsx';
import ImportDialog from '../components/ImportDialog.jsx';
import LoadMoreButton from '../components/LoadMoreButton.jsx';
import Modal from '../components/Modal.jsx';
import MonthPicker from '../components/MonthPicker.jsx';
import ResultCount from '../components/ResultCount.jsx';
import Spinner from '../components/Spinner.jsx';
import SummaryCards from '../components/SummaryCards.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionList from '../components/TransactionList.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { useSummary } from '../hooks/useSummary.js';
import { useTransactions } from '../hooks/useTransactions.js';
import { formatDate } from '../lib/formatDate.js';
import { formatMonth, monthRange } from '../lib/month.js';
import { readUrlState, toUrlSearch } from '../lib/urlState.js';
import { useMoney } from '../components/CurrencyProvider.jsx';

const PAGE_SIZE = 25;

export default function TransactionsPage() {
  const formatMoney = useMoney();
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

  // Press "n" anywhere outside a text field to start a new transaction.
  useEffect(() => {
    function handleKey(event) {
      if (event.key !== 'n' || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target.closest?.('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return;
      const amount = document.querySelector('#new-transaction input[type="number"]');
      if (!amount) return;
      event.preventDefault();
      amount.focus();
      amount.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const range = useMemo(() => monthRange(month), [month]);
  const listQuery = useMemo(() => ({ ...range, ...filters }), [range, filters]);

  // The summary always covers the whole month; the list follows the filters too.
  const monthly = useSummary(month);
  const list = useTransactions(listQuery, { pageSize: PAGE_SIZE });
  const toast = useToast();

  // e.g. "Dining out, $12.50"
  const describe = (tx) => `${getCategory(tx.categoryId)?.label ?? tx.categoryId}, ${formatMoney(tx.amountCents)}`;

  async function handleCreate({ repeat = 'none', ...data }) {
    if (repeat === 'none') {
      await list.create(data);
      toast.show({ message: `Added ${describe(data)}` });
    } else {
      // The server adds the first occurrence (and any already due) straight away.
      const { date, ...template } = data;
      await api.createRecurring({ ...template, frequency: repeat, startDate: date });
      await list.reload();
      toast.show({ message: `Added ${describe(data)}, repeating ${repeat}` });
    }
    await monthly.reload();
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

  const [importing, setImporting] = useState(false);

  async function handleImported({ accepted, rejected }) {
    await Promise.all([list.reload(), monthly.reload()]);
    const skipped = rejected.length ? `, skipped ${rejected.length}` : '';
    toast.show({ message: `Imported ${accepted.length} transactions${skipped}` });
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
    <>
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
      <SummaryCards summary={monthly.summary} label={`Totals for ${formatMonth(month)}`} />
      <TransactionForm id="new-transaction" onSubmit={handleCreate} />
      <FilterBar filters={filters} onChange={setFilters} />
      <div className="list-toolbar">
        <button type="button" className="button button-ghost" onClick={() => setImporting(true)}>
          Import CSV
        </button>
        <a className="button button-ghost" href={api.exportCsvUrl(listQuery)} download>
          Export CSV
        </a>
      </div>
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
      <ImportDialog open={importing} onClose={() => setImporting(false)} onImported={handleImported} />
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
    </>
  );
}
