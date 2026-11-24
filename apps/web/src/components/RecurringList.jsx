import { getCategory } from '@ledgerly/shared';
import { formatDate } from '../lib/formatDate.js';
import { describeSchedule, nextRuleDate } from '../lib/schedule.js';
import Amount from './Amount.jsx';
import CategoryIcon from './CategoryIcon.jsx';

// One row per recurring rule: what it adds, how often, and when next.
// Paused rules are dimmed and can be resumed.
export default function RecurringList({ rules, onTogglePaused, onDelete, busyId }) {
  return (
    <ul className="transaction-list recurring-list">
      {rules.map((rule) => {
        const next = nextRuleDate(rule);
        return (
          <li key={rule.id} className={`transaction recurring-rule${rule.paused ? ' is-paused' : ''}`}>
            <div className="recurring-main">
              <CategoryIcon categoryId={rule.categoryId} />
              <div className="recurring-text">
                <strong>{rule.note || getCategory(rule.categoryId)?.label || rule.categoryId}</strong>
                <span className="recurring-schedule">{describeSchedule(rule)}</span>
                <span className="recurring-next">
                  {rule.paused ? 'Paused' : next ? `Next: ${formatDate(next)}` : 'Ended'}
                </span>
              </div>
            </div>
            <div className="recurring-actions">
              <Amount cents={rule.amountCents} type={rule.type} signed />
              <button
                type="button"
                className="button button-ghost"
                onClick={() => onTogglePaused(rule)}
                disabled={busyId === rule.id}
              >
                {rule.paused ? 'Resume' : 'Pause'}
              </button>
              <button
                type="button"
                className="button button-ghost delete-button"
                onClick={() => onDelete(rule)}
                disabled={busyId === rule.id}
              >
                Delete
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
