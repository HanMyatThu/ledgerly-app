import { formatMoney, getCategory } from '@ledgerly/shared';
import Button from './Button.jsx';
import EmptyState from './EmptyState.jsx';

export default function TransactionList({ transactions, onDelete }) {
  if (!transactions.length) {
    return <EmptyState title="No transactions yet" message="Add your first one above." />;
  }

  return (
    <ul className="transaction-list">
      {transactions.map((tx) => (
        <li key={tx.id} className="transaction">
          <div>
            <strong>{getCategory(tx.categoryId)?.label ?? tx.categoryId}</strong>
            <span className="meta">
              {tx.date}
              {tx.note ? ` · ${tx.note}` : ''}
            </span>
          </div>
          <div className="transaction-actions">
            <span className={`amount ${tx.type}`}>
              {tx.type === 'expense' ? '−' : '+'}
              {formatMoney(tx.amountCents)}
            </span>
            <Button variant="ghost" onClick={() => onDelete(tx.id)}>
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
