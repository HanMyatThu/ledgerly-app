import Amount from './Amount.jsx';
import Card from './Card.jsx';
import ProgressBar from './ProgressBar.jsx';

// Sums every budget in the month: how much is budgeted, spent and left.
export default function BudgetTotals({ progress }) {
  if (!progress.length) return null;
  const budgeted = progress.reduce((sum, budget) => sum + budget.budgetCents, 0);
  const spent = progress.reduce((sum, budget) => sum + budget.spentCents, 0);
  const left = budgeted - spent;
  const overCount = progress.filter((budget) => budget.over).length;

  return (
    <Card className="budget-totals" aria-label="Budget totals">
      <div className="budget-totals-numbers">
        <div>
          <span className="summary-label">Budgeted</span>
          <Amount cents={budgeted} className="summary-value" />
        </div>
        <div>
          <span className="summary-label">Spent</span>
          <Amount cents={spent} className="summary-value" />
        </div>
        <div>
          <span className="summary-label">{left >= 0 ? 'Left' : 'Over'}</span>
          <Amount cents={Math.abs(left)} type={left >= 0 ? 'income' : 'expense'} className="summary-value" />
        </div>
      </div>
      <ProgressBar value={spent} max={budgeted} label="Total budget used" tone={left < 0 ? 'over' : 'normal'} />
      {overCount > 0 && (
        <p className="budget-totals-note">
          {overCount} {overCount === 1 ? 'category is' : 'categories are'} over budget
        </p>
      )}
    </Card>
  );
}
