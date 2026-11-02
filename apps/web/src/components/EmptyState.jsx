export default function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      {title && <strong className="empty-state-title">{title}</strong>}
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}
