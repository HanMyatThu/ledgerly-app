import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import ChartTooltip from './ChartTooltip.jsx';
import { useCurrency } from './CurrencyProvider.jsx';

const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function shortMonth(month) {
  return SHORT_MONTHS[Number(month.slice(5, 7)) - 1];
}

// Compact axis labels in the chosen currency: 1200 dollars becomes "$1.2K".
function compactMoney(currency) {
  const format = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  return (cents) => format.format(cents / 100);
}

// Income next to expenses for each month in the range.
export default function IncomeExpenseBars({ monthly }) {
  const { currency } = useCurrency();
  const axisMoney = useMemo(() => compactMoney(currency), [currency]);
  const data = monthly.map((row) => ({ ...row, label: shortMonth(row.month) }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} barGap={2} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--border)" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: 'var(--muted)', fontSize: 12 }} />
        <YAxis
          tickFormatter={axisMoney}
          tickLine={false}
          axisLine={false}
          width={52}
          tick={{ fill: 'var(--muted)', fontSize: 12 }}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--bg)' }} />
        <Legend
          iconType="square"
          wrapperStyle={{ fontSize: 13 }}
          formatter={(value) => <span style={{ color: 'var(--text)' }}>{value}</span>}
        />
        <Bar dataKey="incomeCents" name="Income" fill="var(--income)" radius={[4, 4, 0, 0]} isAnimationActive={false} />
        <Bar
          dataKey="expenseCents"
          name="Expenses"
          fill="var(--expense)"
          radius={[4, 4, 0, 0]}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
