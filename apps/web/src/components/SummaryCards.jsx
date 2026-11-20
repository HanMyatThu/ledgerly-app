import { formatMoney } from '@ledgerly/shared';
import Amount from './Amount.jsx';
import Card from './Card.jsx';
import TrendBadge from './TrendBadge.jsx';

// Income, expenses and balance for a month, from the summary endpoint.
// Income and expenses also show the change from the month before,
// and expenses show the average spent per day so far.
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
        {summary.averageDailySpendCents > 0 && (
          <span className="summary-note">{formatMoney(summary.averageDailySpendCents)} a day on average</span>
        )}
      </Card>
      <Card>
        <span className="summary-label">Balance</span>
        <Amount cents={summary.balanceCents} className="summary-value" />
      </Card>
    </section>
  );
}
