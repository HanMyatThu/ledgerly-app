import { useMemo, useState } from 'react';
import { api } from '../api.js';
import Alert from './Alert.jsx';
import Button from './Button.jsx';
import FileDrop from './FileDrop.jsx';
import Modal from './Modal.jsx';
import { previewCsv } from '../lib/csvPreview.js';

// Uploads a CSV of transactions in the export layout.
// Calls onImported(result) with the accepted and rejected rows.
export default function ImportDialog({ open, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const preview = useMemo(() => (file ? previewCsv(file.text) : null), [file]);
  const problem = preview?.error ?? (preview?.missing.length ? `Missing columns: ${preview.missing.join(', ')}` : null);
  const canImport = Boolean(file) && !problem && preview.total > 0 && !busy;

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
          <div className="import-file">
            <strong>{file.name}</strong>
            <Button variant="ghost" onClick={reset} disabled={busy}>
              Choose another
            </Button>
          </div>
        ) : (
          <FileDrop onFile={setFile} onError={setError} />
        )}
        {problem && <Alert title="This file can't be imported">{problem}</Alert>}
        {preview && !problem && (
          <div className="import-preview">
            <p>
              {preview.total} {preview.total === 1 ? 'row' : 'rows'} found
              {preview.total > preview.rows.length && `, showing the first ${preview.rows.length}`}
            </p>
            <div className="import-preview-scroll">
              <table className="import-table">
                <thead>
                  <tr>
                    {preview.headers.map((name, i) => (
                      <th key={i} scope="col">
                        {name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.rows.map((cells, r) => (
                    <tr key={r}>
                      {preview.headers.map((_, c) => (
                        <td key={c}>{cells[c]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        <div className="import-actions">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!canImport}>
            {busy ? 'Importing…' : 'Import'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
