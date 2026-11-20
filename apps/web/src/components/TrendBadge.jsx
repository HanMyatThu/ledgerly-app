// A small "▲ 12%" badge comparing a value with last month.
// `goodWhen` says which direction is good news: up for income, down for spending.
export default function TrendBadge({ percent, goodWhen = 'up', label = 'vs last month' }) {
  if (percent === null || percent === undefined) {
    return <span className="trend trend-flat">No data last month</span>;
  }
  const direction = percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat';
  const tone = direction === 'flat' ? 'flat' : direction === goodWhen ? 'good' : 'bad';
  const arrow = direction === 'up' ? '▲' : direction === 'down' ? '▼' : '–';
  return (
    <span className={`trend trend-${tone}`}>
      <span aria-hidden="true">{arrow}</span> {Math.abs(percent)}% {label}
    </span>
  );
}
