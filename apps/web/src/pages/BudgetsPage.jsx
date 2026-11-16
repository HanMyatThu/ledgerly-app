import { useState } from 'react';
import Alert from '../components/Alert.jsx';
import BudgetRow from '../components/BudgetRow.jsx';
import EmptyState from '../components/EmptyState.jsx';
import MonthPicker from '../components/MonthPicker.jsx';
import Spinner from '../components/Spinner.jsx';
import { useBudgets } from '../hooks/useBudgets.js';
import { currentMonth } from '../lib/month.js';

export default function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth);
  const budgets = useBudgets(month);

  return (
    <>
      {budgets.error && (
        <Alert title="Could not load budgets" onDismiss={budgets.clearError}>
          {budgets.error}
        </Alert>
      )}
      <MonthPicker value={month} onChange={setMonth} />
      {budgets.loading && !budgets.progress.length ? (
        <Spinner label="Loading budgets…" />
      ) : budgets.progress.length ? (
        <ul className="budget-list">
          {budgets.progress.map((budget) => (
            <BudgetRow key={budget.categoryId} budget={budget} />
          ))}
        </ul>
      ) : (
        <EmptyState title="No budgets this month" message="Set a monthly limit for a category to track it here." />
      )}
    </>
  );
}
