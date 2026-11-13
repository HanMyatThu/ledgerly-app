import { getCategory } from '@ledgerly/shared';
import { formatDate } from '../lib/formatDate.js';
import { groupByDay } from '../lib/groupByDay.js';
import Amount from './Amount.jsx';
import Button from './Button.jsx';
import CategoryIcon from './CategoryIcon.jsx';
import EmptyState from './EmptyState.jsx';

function TransactionRow({ tx, onEdit, onDelete }) {
  return (
    <li className="transaction">
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
        {onEdit && (
          <Button variant="ghost" className="edit-button" onClick={() => onEdit(tx)}>
            Edit
          </Button>
        )}
        <Button variant="ghost" onClick={() => onDelete(tx.id)}>
          Delete
        </Button>
      </div>
    </li>
  );
}

// With `groupByDay`, rows are shown under a header for each date.
export default function TransactionList({ transactions, onEdit, onDelete, filtered = false, groupByDay: grouped = false }) {
  if (!transactions.length) {
    return filtered ? (
      <EmptyState title="No matching transactions" message="Try other filters or clear them." />
    ) : (
      <EmptyState title="No transactions yet" message="Add your first one above." />
    );
  }

  const row = (tx) => <TransactionRow key={tx.id} tx={tx} onEdit={onEdit} onDelete={onDelete} />;

  if (!grouped) return <ul className="transaction-list">{transactions.map(row)}</ul>;

  return (
    <div className="transaction-groups">
      {groupByDay(transactions).map((group) => (
        <section key={group.date} className="transaction-group" aria-label={formatDate(group.date)}>
          <h3 className="transaction-group-header">
            <time dateTime={group.date}>{formatDate(group.date)}</time>
          </h3>
          <ul className="transaction-list">{group.items.map(row)}</ul>
        </section>
      ))}
    </div>
  );
}
