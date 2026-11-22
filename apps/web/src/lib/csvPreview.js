import { parseCsv } from '@ledgerly/shared';

export const REQUIRED_COLUMNS = ['date', 'type', 'category', 'amount'];

// Reads an uploaded CSV just enough to show it before importing:
// the header, the first few data rows, the row count and any missing columns.
export function previewCsv(text, limit = 5) {
  let rows;
  try {
    rows = parseCsv(text);
  } catch (err) {
    return { error: err.message };
  }
  if (!rows.length) return { error: 'That file is empty.' };
  const [headers, ...body] = rows;
  const names = headers.map((name) => name.trim().toLowerCase());
  const missing = REQUIRED_COLUMNS.filter((name) => !names.includes(name));
  return { headers, rows: body.slice(0, limit), total: body.length, missing };
}
