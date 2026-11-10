import Amount from './Amount.jsx';
import Card from './Card.jsx';

function totals(transactions) {
  return transactions.reduce(
    (acc, tx) => {
      acc[tx.type] += tx.amountCents;
      return acc;
    },
    { income: 0, expense: 0 },
  );
}

export default function SummaryCards({ transactions, label = 'Summary' }) {
  const { income, expense } = totals(transactions);
  const balance = income - expense;

  return (
    <section className="summary" aria-label={label}>
      <h3 className="summary-caption">{label}</h3>
      <Card>
        <span className="summary-label">Income</span>
        <Amount cents={income} type="income" className="summary-value" />
      </Card>
      <Card>
        <span className="summary-label">Expenses</span>
        <Amount cents={expense} type="expense" className="summary-value" />
      </Card>
      <Card>
        <span className="summary-label">Balance</span>
        <Amount cents={balance} className="summary-value" />
      </Card>
    </section>
  );
}
