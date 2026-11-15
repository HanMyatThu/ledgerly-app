import Footer from './Footer.jsx';
import Header from './Header.jsx';
import NavTabs from './NavTabs.jsx';

export default function Layout({ children }) {
  return (
    <div className="app">
      <Header />
      <NavTabs />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
