import { useState } from 'react';
import MonthPicker from '../components/MonthPicker.jsx';
import { currentMonth } from '../lib/month.js';

export default function ReportsPage() {
  const [month, setMonth] = useState(currentMonth);
  return (
    <>
      <MonthPicker value={month} onChange={setMonth} />
    </>
  );
}
