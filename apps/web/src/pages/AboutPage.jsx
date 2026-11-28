import { Link } from 'react-router-dom';
import Card from '../components/Card.jsx';

const REPO_URL = 'https://github.com/HanMyatThu/ledgerly-app';

// What Ledgerly is, how it keeps data, and a few tips.
export default function AboutPage() {
  return (
    <Card as="article" className="about">
      <h2>About Ledgerly</h2>
      <p>
        Ledgerly is a small personal budget and expense tracker. Log what you spend and earn, set monthly budgets per
        category, repeat regular bills automatically, and see where your money goes on the{' '}
        <Link to="/reports">Reports</Link> page.
      </p>

      <h3>Your data</h3>
      <p>
        Everything is stored by the Ledgerly server you run, in a single SQLite file. Nothing is sent anywhere else. Use{' '}
        <strong>Export CSV</strong> on the Transactions page to keep a copy or move to another tool.
      </p>

      <h3>Tips</h3>
      <ul>
        <li>
          Press <kbd>n</kbd> anywhere to jump to the amount field of a new transaction.
        </li>
        <li>Pick a repeat option when adding rent or a subscription, and Ledgerly adds it every week or month.</li>
        <li>The theme switch in the header and the currency setting below are remembered on this device.</li>
        <li>The address bar keeps the month and filters, so a view can be bookmarked.</li>
      </ul>

      <p className="about-meta">
        Version {__APP_VERSION__} · MIT license ·{' '}
        <a href={REPO_URL} target="_blank" rel="noreferrer">
          Source on GitHub
        </a>
      </p>
    </Card>
  );
}
