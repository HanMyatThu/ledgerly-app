import { useMoney } from './CurrencyProvider.jsx';

// Shared hover tooltip for recharts: a title and one row per series, in money.
export default function ChartTooltip({ active, payload, label }) {
  const formatMoney = useMoney();
  if (!active || !payload?.length) return null;
  const title = label ?? payload[0].name;
  return (
    <div className="chart-tooltip">
      <div className="chart-tooltip-title">{title}</div>
      {payload.map((entry) => (
        <div key={entry.dataKey ?? entry.name} className="chart-tooltip-row">
          <span
            className="chart-swatch"
            style={{ background: entry.payload?.fill ?? entry.color }}
            aria-hidden="true"
          />
          {label != null && <span>{entry.name}</span>}
          <strong>{formatMoney(entry.value)}</strong>
        </div>
      ))}
    </div>
  );
}
