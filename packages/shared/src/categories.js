export const TRANSACTION_TYPES = ['expense', 'income'];

export const CATEGORIES = [
  { id: 'groceries', label: 'Groceries', type: 'expense' },
  { id: 'dining', label: 'Dining out', type: 'expense' },
  { id: 'transport', label: 'Transport', type: 'expense' },
  { id: 'housing', label: 'Housing', type: 'expense' },
  { id: 'utilities', label: 'Utilities', type: 'expense' },
  { id: 'health', label: 'Health', type: 'expense' },
  { id: 'entertainment', label: 'Entertainment', type: 'expense' },
  { id: 'shopping', label: 'Shopping', type: 'expense' },
  { id: 'other-expense', label: 'Other', type: 'expense' },
  { id: 'salary', label: 'Salary', type: 'income' },
  { id: 'freelance', label: 'Freelance', type: 'income' },
  { id: 'other-income', label: 'Other', type: 'income' },
];

export function getCategory(id) {
  return CATEGORIES.find((category) => category.id === id) ?? null;
}

export function categoriesFor(type) {
  return CATEGORIES.filter((category) => category.type === type);
}
