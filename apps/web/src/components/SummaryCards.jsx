import { formatMoney } from '@ledgerly/shared';
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

export default function SummaryCards({ transactions }) {
  const { income, expense } = totals(transactions);
  const balance = income - expense;

  return (
    <section className="summary">
      <Card>
        <span className="summary-label">Income</span>
        <span className="summary-value income">{formatMoney(income)}</span>
      </Card>
      <Card>
        <span className="summary-label">Expenses</span>
        <span className="summary-value expense">{formatMoney(expense)}</span>
      </Card>
      <Card>
        <span className="summary-label">Balance</span>
        <span className={`summary-value ${balance < 0 ? 'expense' : ''}`}>{formatMoney(balance)}</span>
      </Card>
    </section>
  );
}
