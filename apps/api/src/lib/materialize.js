import { addDays, occurrencesBetween } from '@ledgerly/shared';

// Turns every due occurrence of the active recurring rules into a transaction,
// up to and including `today` (YYYY-MM-DD). Each rule resumes the day after its
// lastDate, so running this again never adds the same occurrence twice.
// Returns the transactions it created.
export function materializeRecurring({ recurring, store, today }) {
  const created = [];
  for (const rule of recurring.listActive()) {
    const from = rule.lastDate ? addDays(rule.lastDate, 1) : rule.startDate;
    const dates = occurrencesBetween(rule, from, today);
    for (const date of dates) {
      created.push(
        store.create({
          type: rule.type,
          amountCents: rule.amountCents,
          categoryId: rule.categoryId,
          note: rule.note,
          date,
          recurringId: rule.id,
        }),
      );
      recurring.setLastDate(rule.id, date);
    }
  }
  return created;
}
