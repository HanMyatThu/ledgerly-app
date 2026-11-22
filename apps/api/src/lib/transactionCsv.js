import { toCsv } from '@ledgerly/shared';

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
