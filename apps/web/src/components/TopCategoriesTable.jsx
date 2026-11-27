import { getCategory } from '@ledgerly/shared';
import CategoryIcon from './CategoryIcon.jsx';
import { useMoney } from './CurrencyProvider.jsx';

// The categories with the most spending this month, largest first,
// with each one's share of all spending in the month.
export default function TopCategoriesTable({ rows }) {
  const formatMoney = useMoney();
  return (
    <table className="top-table">
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col" className="num">
            Spent
          </th>
          <th scope="col" className="share-col">
            Share of spend
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.categoryId}>
            <td>
              <div className="cell-row">
                <CategoryIcon categoryId={row.categoryId} />
                <span>{getCategory(row.categoryId)?.label ?? row.categoryId}</span>
              </div>
            </td>
            <td className="num">{formatMoney(row.totalCents)}</td>
            <td className="share-col">
              <div className="cell-row">
                <span className="share-bar" aria-hidden="true">
                  <span style={{ width: `${row.percent}%` }} />
                </span>
                <span className="share-value">{row.percent}%</span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
