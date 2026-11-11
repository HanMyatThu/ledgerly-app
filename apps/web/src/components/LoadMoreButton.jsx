import Button from './Button.jsx';

// Shown under a paged list while more items remain.
export default function LoadMoreButton({ loaded, total, loading, onClick }) {
  if (loaded >= total) return null;
  return (
    <div className="load-more">
      <Button variant="ghost" onClick={onClick} disabled={loading}>
        {loading ? 'Loading…' : `Load more (${total - loaded} left)`}
      </Button>
    </div>
  );
}
