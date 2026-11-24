import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import RecurringList from '../components/RecurringList.jsx';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { useRecurring } from '../hooks/useRecurring.js';

// Weekly and monthly rules that add transactions on their own.
export default function RecurringPage() {
  const { rules, loading, error, reload } = useRecurring();
  const toast = useToast();
  const [busyId, setBusyId] = useState(null);

  // Resuming adds any occurrences that fell due while the rule was paused.
  async function togglePaused(rule) {
    setBusyId(rule.id);
    try {
      await (rule.paused ? api.resumeRecurring(rule.id) : api.pauseRecurring(rule.id));
      await reload();
      toast.show({ message: rule.paused ? 'Rule resumed' : 'Rule paused' });
    } catch (err) {
      toast.show({ message: `Could not update the rule: ${err.message}` });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="recurring-page" aria-label="Recurring transactions">
      <p className="page-intro">
        These rules add a transaction every week or month. To create one, pick a repeat option when you add a
        transaction.
      </p>
      {error && <Alert title="Could not load recurring rules">{error}</Alert>}
      {loading ? (
        <Spinner label="Loading recurring rules…" />
      ) : rules.length ? (
        <RecurringList rules={rules} onTogglePaused={togglePaused} busyId={busyId} />
      ) : (
        <EmptyState
          title="No recurring transactions yet"
          message="Rent, salary and subscriptions are good candidates."
          action={
            <Link to="/" className="button button-primary">
              Add one
            </Link>
          }
        />
      )}
    </section>
  );
}
