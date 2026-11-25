// Minimal RFC 4180 CSV writing, enough for exporting transactions.

const NEEDS_QUOTES = /[",\r\n]/;
// Cells starting with these can run as formulas in spreadsheet apps.
const FORMULA_START = /^[=+\-@\t\r]/;

function escapeCell(value) {
  if (value === null || value === undefined) return '';
  let text = String(value);
  if (typeof value === 'string' && FORMULA_START.test(text)) text = `'${text}`;
  return NEEDS_QUOTES.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

// Turns an array of objects into CSV text with a header row.
// `columns` is a list of { key, header } and sets both order and names.
export function toCsv(rows, columns) {
  const lines = [columns.map((column) => escapeCell(column.header ?? column.key)).join(',')];
  for (const row of rows) {
    lines.push(columns.map((column) => escapeCell(row[column.key])).join(','));
  }
  return `${lines.join('\r\n')}\r\n`;
}

// Reads CSV text into an array of rows, each an array of cell strings.
// Handles quoted cells (with commas, quotes and new lines inside), CRLF or LF
// line endings, a leading byte-order mark and a trailing new line.
// Throws when a quoted cell is never closed.
export function parseCsv(text) {
  const input = String(text ?? '').replace(/^\uFEFF/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;
  let i = 0;

  while (i < input.length) {
    const char = input[i];
    if (inQuotes) {
      if (char === '"' && input[i + 1] === '"') {
        cell += '"';
        i += 2;
        continue;
      }
      if (char === '"') inQuotes = false;
      else cell += char;
      i += 1;
      continue;
    }
    if (char === '"' && cell === '') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\n' || char === '\r') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      if (char === '\r' && input[i + 1] === '\n') i += 1;
    } else {
      cell += char;
    }
    i += 1;
  }

  if (inQuotes) throw new Error('Unclosed quote in CSV');
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  // Blank lines carry no data.
  return rows.filter((cells) => !(cells.length === 1 && cells[0] === ''));
}
