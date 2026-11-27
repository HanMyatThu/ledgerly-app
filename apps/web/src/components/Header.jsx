import ThemeToggle from './ThemeToggle.jsx';

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header-row">
        <h1>Ledgerly</h1>
        <ThemeToggle />
      </div>
      <p>Track what you spend and earn.</p>
    </header>
  );
}
