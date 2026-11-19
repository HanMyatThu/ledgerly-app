import { getCategory } from '@ledgerly/shared';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
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
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
