import Card from './Card.jsx';

// A titled card that holds one chart or table on the Reports page.
export default function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <Card as="section" className={`chart-card ${className}`.trim()} aria-label={title}>
      <header className="chart-card-header">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </header>
      <div className="chart-card-body">{children}</div>
    </Card>
  );
}
