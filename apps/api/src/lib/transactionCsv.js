import { parseCsv, toCents, toCsv } from '@ledgerly/shared';
import { HttpError } from '../http.js';

// The CSV layout for transactions, shared by export and import.
// Amounts are written in dollars with two decimals, so the file reads well in a spreadsheet.
export const CSV_COLUMNS = [
  { key: 'date', header: 'date' },
  { key: 'type', header: 'type' },
  { key: 'categoryId', header: 'category' },
  { key: 'amount', header: 'amount' },
  { key: 'note', header: 'note' },
];

export function transactionsToCsv(transactions) {
  const rows = transactions.map((item) => ({ ...item, amount: (item.amountCents / 100).toFixed(2) }));
  return toCsv(rows, CSV_COLUMNS);
}

const REQUIRED_HEADERS = ['date', 'type', 'category', 'amount'];
export const MAX_IMPORT_ROWS = 1000;

// Export prefixes formula-like text with an apostrophe; take it off again on import.
function cleanNote(value) {
  const note = (value ?? '').trim();
  if (!note) return undefined;
  return /^'[=+\-@]/.test(note) ? note.slice(1) : note;
}

// Turns an uploaded CSV into transaction drafts, each with its line number in the file.
// Throws a 400 when the file itself is unusable: empty, malformed, too long or missing columns.
export function csvToDrafts(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new HttpError(400, 'Send the CSV file as the request body with Content-Type text/csv');
  }
  let rows;
  try {
    rows = parseCsv(text);
  } catch (err) {
    throw new HttpError(400, err.message);
  }
  const [header = [], ...body] = rows;
  const index = Object.fromEntries(header.map((name, i) => [name.trim().toLowerCase(), i]));
  const missing = REQUIRED_HEADERS.filter((name) => !(name in index));
  if (missing.length) throw new HttpError(400, `CSV is missing columns: ${missing.join(', ')}`);
  if (body.length > MAX_IMPORT_ROWS) {
    throw new HttpError(400, `CSV has ${body.length} rows; the most one import takes is ${MAX_IMPORT_ROWS}`);
  }

  const cell = (cells, name) => (name in index ? (cells[index[name]] ?? '').trim() : '');
  return body.map((cells, i) => ({
    line: i + 2,
    data: {
      date: cell(cells, 'date'),
      type: cell(cells, 'type').toLowerCase(),
      categoryId: cell(cells, 'category').toLowerCase(),
      amountCents: toCents(cell(cells, 'amount')),
      note: cleanNote(cells[index.note]),
    },
  }));
}
