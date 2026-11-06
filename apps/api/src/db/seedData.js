// A believable month of sample transactions for local development.
// Days are offsets into the month; amounts are in cents.
const TEMPLATE = [
  { day: 1, type: 'income', categoryId: 'salary', amountCents: 320000, note: 'Monthly salary' },
  { day: 1, type: 'expense', categoryId: 'housing', amountCents: 120000, note: 'Rent' },
  { day: 2, type: 'expense', categoryId: 'groceries', amountCents: 6420, note: 'Weekly shop' },
  { day: 3, type: 'expense', categoryId: 'transport', amountCents: 4500, note: 'Transit pass top-up' },
  { day: 5, type: 'expense', categoryId: 'dining', amountCents: 1850, note: 'Lunch with team' },
  { day: 6, type: 'expense', categoryId: 'utilities', amountCents: 8900, note: 'Electricity' },
  { day: 8, type: 'expense', categoryId: 'entertainment', amountCents: 1599, note: 'Streaming subscription' },
  { day: 9, type: 'expense', categoryId: 'groceries', amountCents: 5730, note: 'Weekly shop' },
  { day: 11, type: 'income', categoryId: 'freelance', amountCents: 45000, note: 'Logo design job' },
  { day: 12, type: 'expense', categoryId: 'health', amountCents: 3200, note: 'Pharmacy' },
  { day: 14, type: 'expense', categoryId: 'dining', amountCents: 4275, note: 'Dinner out' },
  { day: 16, type: 'expense', categoryId: 'groceries', amountCents: 6105, note: 'Weekly shop' },
  { day: 17, type: 'expense', categoryId: 'shopping', amountCents: 7999, note: 'Running shoes' },
  { day: 19, type: 'expense', categoryId: 'utilities', amountCents: 3500, note: 'Internet' },
  { day: 21, type: 'expense', categoryId: 'transport', amountCents: 2200, note: 'Taxi home' },
  { day: 23, type: 'expense', categoryId: 'groceries', amountCents: 5890, note: 'Weekly shop' },
  { day: 24, type: 'expense', categoryId: 'entertainment', amountCents: 2600, note: 'Cinema' },
  { day: 26, type: 'expense', categoryId: 'dining', amountCents: 1240, note: 'Coffee and cake' },
  { day: 27, type: 'income', categoryId: 'other-income', amountCents: 2500, note: 'Sold old books' },
  { day: 28, type: 'expense', categoryId: 'other-expense', amountCents: 1500, note: 'Gift for a friend' },
];

function pad(value) {
  return String(value).padStart(2, '0');
}

// Returns the sample transactions dated within the given month ("YYYY-MM").
export function seedTransactions(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  return TEMPLATE.map(({ day, ...rest }) => ({
    ...rest,
    date: `${year}-${pad(monthNumber)}-${pad(Math.min(day, lastDay))}`,
  }));
}

export function currentMonth(now = new Date()) {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}
