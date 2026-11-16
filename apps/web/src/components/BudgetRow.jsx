import { formatMoney, getCategory } from '@ledgerly/shared';
import CategoryIcon from './CategoryIcon.jsx';
import ProgressBar from './ProgressBar.jsx';

// One budget with how much of it has been spent.
export default function BudgetRow({ budget, actions }) {
  const label = getCategory(budget.categoryId)?.label ?? budget.categoryId;
  const remaining = budget.remainingCents;

  return (
    <li className="budget-row">
      <CategoryIcon categoryId={budget.categoryId} />
      <div className="budget-row-body">
        <div className="budget-row-top">
          <strong>{label}</strong>
          <span className="budget-row-numbers">
            {formatMoney(budget.spentCents)} of {formatMoney(budget.budgetCents)}
          </span>
        </div>
        <ProgressBar value={budget.spentCents} max={budget.budgetCents} label={`${label} budget used`} />
        <span className="budget-row-remaining">
          {remaining >= 0 ? `${formatMoney(remaining)} left` : `${formatMoney(-remaining)} over`} · {budget.percent}%
        </span>
      </div>
      {actions && <div className="budget-row-actions">{actions}</div>}
    </li>
  );
}
