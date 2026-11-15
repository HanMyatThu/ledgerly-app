import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<TransactionsPage />} />
      </Routes>
    </Layout>
  );
}
