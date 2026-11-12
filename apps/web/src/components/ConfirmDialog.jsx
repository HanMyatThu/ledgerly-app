import { useState } from 'react';
import Button from './Button.jsx';
import Modal from './Modal.jsx';

// Asks the user to confirm an action. `onConfirm` may be async; the dialog
// stays open with the buttons disabled until it finishes.
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} title={title} onClose={busy ? () => {} : onCancel}>
      {message && <p className="confirm-message">{message}</p>}
      <div className="confirm-actions">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button className={danger ? 'button-danger' : ''} onClick={handleConfirm} disabled={busy}>
          {busy ? 'Working…' : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
