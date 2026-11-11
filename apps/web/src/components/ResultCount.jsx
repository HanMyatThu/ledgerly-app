// "Showing 25 of 40 transactions", or just the total when everything is loaded.
export default function ResultCount({ shown, total }) {
  if (!total) return null;
  const noun = total === 1 ? 'transaction' : 'transactions';
  return (
    <p className="result-count" aria-live="polite">
      {shown < total ? `Showing ${shown} of ${total} ${noun}` : `${total} ${noun}`}
    </p>
  );
}
