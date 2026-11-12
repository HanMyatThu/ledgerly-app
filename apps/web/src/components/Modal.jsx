import { useEffect, useId, useRef } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
import { createPortal } from 'react-dom';

// A centered dialog rendered into document.body.
export default function Modal({ open, title, onClose, children }) {
  const titleId = useId();
  const dialogRef = useRef(null);

  // Move focus into the dialog when it opens and give it back when it closes.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.activeElement;
    const dialog = dialogRef.current;
    const first = dialog?.querySelector('.modal-body ' + FOCUSABLE) ?? dialog?.querySelector(FOCUSABLE);
    first?.focus();
    return () => previous?.focus?.();
  }, [open]);

  // Keep Tab and Shift+Tab cycling inside the dialog.
  function handleKeyDown(event) {
    if (event.key !== 'Tab') return;
    const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

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

  // Only a press that starts on the backdrop itself closes the dialog,
  // so dragging a text selection out of the dialog does not.
  function handleBackdrop(event) {
    if (event.target === event.currentTarget) onClose();
  }

  return createPortal(
    <div className="modal-backdrop" onMouseDown={handleBackdrop}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onKeyDown={handleKeyDown}
      >
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
