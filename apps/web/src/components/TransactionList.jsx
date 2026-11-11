import { getCategory } from '@ledgerly/shared';
import { formatDate } from '../lib/formatDate.js';
import Amount from './Amount.jsx';
import Button from './Button.jsx';
import CategoryIcon from './CategoryIcon.jsx';
import EmptyState from './EmptyState.jsx';

export default function TransactionList({ transactions, onDelete, filtered = false }) {
  if (!transactions.length) {
    return filtered ? (
      <EmptyState title="No matching transactions" message="Try other filters or clear them." />
    ) : (
      <EmptyState title="No transactions yet" message="Add your first one above." />
    );
  }

  return (
    <ul className="transaction-list">
      {transactions.map((tx) => (
        <li key={tx.id} className="transaction">
          <div className="transaction-main">
            <CategoryIcon categoryId={tx.categoryId} />
            <div>
              <strong>{getCategory(tx.categoryId)?.label ?? tx.categoryId}</strong>
              <span className="meta">
                <time dateTime={tx.date}>{formatDate(tx.date)}</time>
                {tx.note ? ` · ${tx.note}` : ''}
              </span>
            </div>
          </div>
          <div className="transaction-actions">
            <Amount cents={tx.amountCents} type={tx.type} signed />
            <Button variant="ghost" onClick={() => onDelete(tx.id)}>
              Delete
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
