import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', label: 'Transactions', end: true },
  { to: '/budgets', label: 'Budgets' },
];

export default function NavTabs() {
  return (
    <nav className="nav-tabs" aria-label="Main">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => (isActive ? 'nav-tab active' : 'nav-tab')}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
