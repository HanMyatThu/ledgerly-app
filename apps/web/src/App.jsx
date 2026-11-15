import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import BudgetsPage from './pages/BudgetsPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TransactionsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
      </Routes>
    </Layout>
  );
}
