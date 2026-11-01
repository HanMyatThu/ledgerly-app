import Footer from './Footer.jsx';
import Header from './Header.jsx';

export default function Layout({ children }) {
  return (
    <div className="app">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
