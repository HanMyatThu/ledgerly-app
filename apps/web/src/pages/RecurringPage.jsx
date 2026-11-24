import { Link } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import EmptyState from '../components/EmptyState.jsx';
import RecurringList from '../components/RecurringList.jsx';
import Spinner from '../components/Spinner.jsx';
import { useRecurring } from '../hooks/useRecurring.js';

// Weekly and monthly rules that add transactions on their own.
export default function RecurringPage() {
  const { rules, loading, error } = useRecurring();

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
        <RecurringList rules={rules} />
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
