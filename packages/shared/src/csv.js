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
