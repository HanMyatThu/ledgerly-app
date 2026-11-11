import { useId } from 'react';
import { createPortal } from 'react-dom';

// A centered dialog rendered into document.body.
export default function Modal({ open, title, onClose, children }) {
  const titleId = useId();
  if (!open) return null;

  return createPortal(
    <div className="modal-backdrop">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
