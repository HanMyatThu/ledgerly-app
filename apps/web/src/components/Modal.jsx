import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';

// A centered dialog rendered into document.body.
export default function Modal({ open, title, onClose, children }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    function handleKey(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    // Stop the page behind the dialog from scrolling.
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  // Only a click that starts and ends on the backdrop itself closes the dialog,
  // so dragging a text selection out of the dialog does not.
  function handleBackdrop(event) {
    if (event.target === event.currentTarget) onClose();
  }

  return createPortal(
    <div className="modal-backdrop" onMouseDown={handleBackdrop}>
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
