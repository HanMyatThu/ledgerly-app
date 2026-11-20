import Amount from './Amount.jsx';
import Card from './Card.jsx';
import TrendBadge from './TrendBadge.jsx';

// Income, expenses and balance for a month, from the summary endpoint.
// Income and expenses also show the change from the month before.
export default function SummaryCards({ summary, label = 'Summary' }) {
  const previous = summary.previous;
  return (
    <section className="summary" aria-label={label}>
      <h3 className="summary-caption">{label}</h3>
      <Card>
        <span className="summary-label">Income</span>
        <Amount cents={summary.incomeCents} type="income" className="summary-value" />
        {previous && <TrendBadge percent={previous.incomeChangePercent} goodWhen="up" />}
      </Card>
      <Card>
        <span className="summary-label">Expenses</span>
        <Amount cents={summary.expenseCents} type="expense" className="summary-value" />
        {previous && <TrendBadge percent={previous.expenseChangePercent} goodWhen="down" />}
      </Card>
      <Card>
        <span className="summary-label">Balance</span>
        <Amount cents={summary.balanceCents} className="summary-value" />
      </Card>
    </section>
  );
}
