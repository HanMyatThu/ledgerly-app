import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import BudgetsPage from './pages/BudgetsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import RecurringPage from './pages/RecurringPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TransactionsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/recurring" element={<RecurringPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Layout>
  );
}
