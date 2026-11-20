import { useState } from 'react';
import Alert from '../components/Alert.jsx';
import CategoryDonut from '../components/CategoryDonut.jsx';
import ChartCard from '../components/ChartCard.jsx';
import IncomeExpenseBars from '../components/IncomeExpenseBars.jsx';
import MonthPicker from '../components/MonthPicker.jsx';
import Spinner from '../components/Spinner.jsx';
import SummaryCards from '../components/SummaryCards.jsx';
import TopCategoriesTable from '../components/TopCategoriesTable.jsx';
import { useReports } from '../hooks/useReports.js';
import { currentMonth } from '../lib/month.js';

export default function ReportsPage() {
  const [month, setMonth] = useState(currentMonth);
  const { summary, monthly, categories, top, loading, error } = useReports(month);

  return (
    <>
      <MonthPicker value={month} onChange={setMonth} />
      {error && <Alert title="Could not load reports">{error}</Alert>}
      {loading ? (
        <Spinner label="Loading reports…" />
      ) : (
        <div className="report-grid">
          {summary && <SummaryCards summary={summary} label="This month at a glance" />}
          <ChartCard title="Spending by category">
            <CategoryDonut categories={categories} />
          </ChartCard>
          <ChartCard title="Income and expenses" subtitle="Last six months">
            <IncomeExpenseBars monthly={monthly} />
          </ChartCard>
          <ChartCard title="Top categories" subtitle="Where most of the money went">
            <TopCategoriesTable rows={top} />
          </ChartCard>
        </div>
      )}
    </>
  );
}
