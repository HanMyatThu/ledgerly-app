// A short message with an optional action, such as "Undo".
export default function Toast({ message, actionLabel, onAction, onDismiss }) {
  return (
    <div className="toast" role="status">
      <span className="toast-message">{message}</span>
      {actionLabel && (
        <button type="button" className="toast-action" onClick={onAction}>
          {actionLabel}
        </button>
      )}
      <button type="button" className="toast-dismiss" aria-label="Dismiss" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}
