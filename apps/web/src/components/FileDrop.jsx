import { useId, useState } from 'react';

const MAX_BYTES = 1024 * 1024;

// A drop zone for one text file, with a click-to-browse fallback.
// Calls onFile({ name, text }) once the file is read, or onError(message).
export default function FileDrop({ accept = '.csv,text/csv', label = 'Drop a CSV file here', onFile, onError }) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);

  async function read(file) {
    if (!file) return;
    if (file.size > MAX_BYTES) {
      onError?.('That file is larger than 1 MB.');
      return;
    }
    try {
      onFile({ name: file.name, text: await file.text() });
    } catch {
      onError?.('Could not read that file.');
    }
  }

  return (
    <div
      className={`file-drop${dragging ? ' file-drop-active' : ''}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        read(event.dataTransfer.files?.[0]);
      }}
    >
      <p className="file-drop-label">{label}</p>
      <label htmlFor={inputId} className="button button-ghost">
        Choose file
      </label>
      <input
        id={inputId}
        type="file"
        accept={accept}
        className="visually-hidden"
        onChange={(event) => {
          read(event.target.files?.[0]);
          // Allow picking the same file again.
          event.target.value = '';
        }}
      />
    </div>
  );
}
