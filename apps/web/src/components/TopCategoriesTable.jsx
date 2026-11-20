import { formatMoney, getCategory } from '@ledgerly/shared';
import CategoryIcon from './CategoryIcon.jsx';

// The categories with the most spending this month, largest first.
export default function TopCategoriesTable({ rows }) {
  return (
    <table className="top-table">
      <thead>
        <tr>
          <th scope="col">Category</th>
          <th scope="col" className="num">
            Spent
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.categoryId}>
            <td>
              <CategoryIcon categoryId={row.categoryId} />
              <span>{getCategory(row.categoryId)?.label ?? row.categoryId}</span>
            </td>
            <td className="num">{formatMoney(row.totalCents)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
