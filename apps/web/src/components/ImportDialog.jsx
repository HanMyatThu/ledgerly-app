import { useState } from 'react';
import { api } from '../api.js';
import Alert from './Alert.jsx';
import Button from './Button.jsx';
import FileDrop from './FileDrop.jsx';
import Modal from './Modal.jsx';

// Uploads a CSV of transactions in the export layout.
// Calls onImported(result) with the accepted and rejected rows.
export default function ImportDialog({ open, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  function reset() {
    setFile(null);
    setError(null);
    setBusy(false);
  }

  function close() {
    reset();
    onClose();
  }

  async function handleImport() {
    setBusy(true);
    setError(null);
    try {
      const result = await api.importCsv(file.text);
      onImported(result);
      close();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Modal open={open} title="Import transactions" onClose={close}>
      <div className="import-dialog">
        <p className="import-help">
          Use the same columns as the export: <code>date</code>, <code>type</code>, <code>category</code>,{' '}
          <code>amount</code> and an optional <code>note</code>.
        </p>
        {error && <Alert title="Import failed">{error}</Alert>}
        {file ? (
          <p className="import-file">
            <strong>{file.name}</strong>
            <Button variant="ghost" onClick={reset} disabled={busy}>
              Choose another
            </Button>
          </p>
        ) : (
          <FileDrop onFile={setFile} onError={setError} />
        )}
        <div className="import-actions">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || busy}>
            {busy ? 'Importing…' : 'Import'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
