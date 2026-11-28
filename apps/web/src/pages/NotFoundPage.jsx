import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import EmptyState from '../components/EmptyState.jsx';

// Shown for any address the app does not know.
export default function NotFoundPage() {
  const { pathname } = useLocation();

  useEffect(() => {
    const previous = document.title;
    document.title = 'Page not found · Ledgerly';
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <EmptyState
      title="Page not found"
      message={`There is nothing at ${pathname}. It may have moved, or the link may be mistyped.`}
      action={
        <Link to="/" className="button button-primary">
          Back to transactions
        </Link>
      }
    />
  );
}
