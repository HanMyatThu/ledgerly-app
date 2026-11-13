// Splits a date-sorted list into runs that share a date, keeping order:
// [{ date, items: [...] }, ...]
export function groupByDay(transactions) {
  const groups = [];
  for (const tx of transactions) {
    const last = groups[groups.length - 1];
    if (last && last.date === tx.date) last.items.push(tx);
    else groups.push({ date: tx.date, items: [tx] });
  }
  return groups;
}

// Income minus expenses for a group of transactions, in cents.
export function netTotal(transactions) {
  return transactions.reduce((sum, tx) => sum + (tx.type === 'income' ? tx.amountCents : -tx.amountCents), 0);
}
