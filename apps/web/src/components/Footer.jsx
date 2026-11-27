import CurrencySelect from './CurrencySelect.jsx';

const REPO_URL = 'https://github.com/HanMyatThu/ledgerly-app';

export default function Footer() {
  return (
    <footer className="app-footer">
      <span>Ledgerly v{__APP_VERSION__}</span>
      <CurrencySelect />
      <a href={REPO_URL} target="_blank" rel="noreferrer">
        Source on GitHub
      </a>
    </footer>
  );
}
