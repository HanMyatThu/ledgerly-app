export default function Alert({ tone = 'error', title, children, onDismiss }) {
  return (
    <div className={`alert alert-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <div className="alert-body">
        {title && <strong>{title}</strong>}
        {children && <span>{children}</span>}
      </div>
      {onDismiss && (
        <button type="button" className="alert-dismiss" aria-label="Dismiss" onClick={onDismiss}>
          ×
        </button>
      )}
    </div>
  );
}
