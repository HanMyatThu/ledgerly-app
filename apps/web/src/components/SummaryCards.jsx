import Amount from './Amount.jsx';
import Card from './Card.jsx';

// Income, expenses and balance for a month, from the summary endpoint.
export default function SummaryCards({ summary, label = 'Summary' }) {
  return (
    <section className="summary" aria-label={label}>
      <h3 className="summary-caption">{label}</h3>
      <Card>
        <span className="summary-label">Income</span>
        <Amount cents={summary.incomeCents} type="income" className="summary-value" />
      </Card>
      <Card>
        <span className="summary-label">Expenses</span>
        <Amount cents={summary.expenseCents} type="expense" className="summary-value" />
      </Card>
      <Card>
        <span className="summary-label">Balance</span>
        <Amount cents={summary.balanceCents} className="summary-value" />
      </Card>
    </section>
  );
}
