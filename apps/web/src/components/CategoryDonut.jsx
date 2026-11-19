import { formatMoney, getCategory } from '@ledgerly/shared';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import ChartTooltip from './ChartTooltip.jsx';
import { categoryColor } from '../lib/chartColors.js';

// Share of spending by category for one month.
export default function CategoryDonut({ categories }) {
  const data = categories.map((row) => ({
    ...row,
    name: getCategory(row.categoryId)?.label ?? row.categoryId,
  }));

  return (
    <div className="donut">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="totalCents"
            nameKey="name"
            innerRadius="58%"
            outerRadius="90%"
            paddingAngle={1}
            stroke="var(--surface)"
            strokeWidth={2}
            isAnimationActive={false}
          >
            {data.map((row) => (
              <Cell key={row.categoryId} fill={categoryColor(row.categoryId)} />
            ))}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="chart-legend">
        {data.map((row) => (
          <li key={row.categoryId}>
            <span className="chart-swatch" style={{ background: categoryColor(row.categoryId) }} aria-hidden="true" />
            <span className="chart-legend-label">{row.name}</span>
            <span className="chart-legend-value">
              {formatMoney(row.totalCents)} · {row.percent}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
