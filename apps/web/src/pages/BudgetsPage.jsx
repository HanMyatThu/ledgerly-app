import { useState } from 'react';
import { formatMoney, getCategory } from '@ledgerly/shared';
import Alert from '../components/Alert.jsx';
import Button from '../components/Button.jsx';
import BudgetForm from '../components/BudgetForm.jsx';
import BudgetRow from '../components/BudgetRow.jsx';
import EmptyState from '../components/EmptyState.jsx';
import MonthPicker from '../components/MonthPicker.jsx';
import Spinner from '../components/Spinner.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { useBudgets } from '../hooks/useBudgets.js';
import { currentMonth, formatMonth } from '../lib/month.js';

export default function BudgetsPage() {
  const [month, setMonth] = useState(currentMonth);
  const budgets = useBudgets(month);
  const toast = useToast();

  async function handleSet({ categoryId, amountCents }) {
    await budgets.setBudget(categoryId, amountCents);
    toast.show({ message: `${getCategory(categoryId).label} budget set to ${formatMoney(amountCents)}` });
  }

  async function handleRemove(budget) {
    const label = getCategory(budget.categoryId)?.label ?? budget.categoryId;
    try {
      await budgets.removeBudget(budget.categoryId);
      toast.show({
        message: `Removed ${label} budget`,
        actionLabel: 'Undo',
        onAction: () => budgets.setBudget(budget.categoryId, budget.budgetCents),
      });
    } catch (err) {
      toast.show({ message: `Could not remove budget: ${err.message}` });
    }
  }

  return (
    <>
      {budgets.error && (
        <Alert title="Could not load budgets" onDismiss={budgets.clearError}>
          {budgets.error}
        </Alert>
      )}
      <MonthPicker value={month} onChange={setMonth} />
      <BudgetForm key={month} month={month} onSubmit={handleSet} />
      {budgets.loading && !budgets.progress.length ? (
        <Spinner label="Loading budgets…" />
      ) : budgets.progress.length ? (
        <ul className="budget-list">
          {budgets.progress.map((budget) => (
            <BudgetRow
              key={budget.categoryId}
              budget={budget}
              actions={
                <Button variant="ghost" onClick={() => handleRemove(budget)}>
                  Remove
                </Button>
              }
            />
          ))}
        </ul>
      ) : (
        <EmptyState title="No budgets this month" message={`Set a limit above to start tracking ${formatMonth(month)}.`} />
      )}
    </>
  );
}
