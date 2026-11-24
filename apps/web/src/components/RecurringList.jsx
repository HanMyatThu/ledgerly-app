import { getCategory } from '@ledgerly/shared';
import { formatDate } from '../lib/formatDate.js';
import { describeSchedule, nextRuleDate } from '../lib/schedule.js';
import Amount from './Amount.jsx';
import CategoryIcon from './CategoryIcon.jsx';

// One row per recurring rule: what it adds, how often, and when next.
export default function RecurringList({ rules }) {
  return (
    <ul className="transaction-list recurring-list">
      {rules.map((rule) => {
        const next = nextRuleDate(rule);
        return (
          <li key={rule.id} className="transaction recurring-rule">
            <div className="recurring-main">
              <CategoryIcon categoryId={rule.categoryId} />
              <div className="recurring-text">
                <strong>{rule.note || getCategory(rule.categoryId)?.label || rule.categoryId}</strong>
                <span className="recurring-schedule">{describeSchedule(rule)}</span>
                <span className="recurring-next">{next ? `Next: ${formatDate(next)}` : 'Ended'}</span>
              </div>
            </div>
            <Amount cents={rule.amountCents} type={rule.type} signed />
          </li>
        );
      })}
    </ul>
  );
}
