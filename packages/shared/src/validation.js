import { TRANSACTION_TYPES, getCategory } from './categories.js';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// Validates a transaction payload. Returns a map of field -> message;
// an empty object means the input is valid.
export function validateTransaction(input) {
  const errors = {};
  const data = input ?? {};

  if (!TRANSACTION_TYPES.includes(data.type)) {
    errors.type = 'Type must be "expense" or "income"';
  }

  if (!Number.isInteger(data.amountCents) || data.amountCents <= 0) {
    errors.amountCents = 'Amount must be a positive number of cents';
  }

  const category = getCategory(data.categoryId);
  if (!category) {
    errors.categoryId = 'Unknown category';
  } else if (data.type && category.type !== data.type) {
    errors.categoryId = `Category does not match type "${data.type}"`;
  }

  if (typeof data.date !== 'string' || !DATE_PATTERN.test(data.date) || Number.isNaN(Date.parse(data.date))) {
    errors.date = 'Date must be in YYYY-MM-DD format';
  }

  if (data.note != null && (typeof data.note !== 'string' || data.note.length > 200)) {
    errors.note = 'Note must be text of at most 200 characters';
  }

  return errors;
}

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

// Validates a monthly budget: an expense category, a month (YYYY-MM)
// and a positive limit in cents.
export function validateBudget(input) {
  const errors = {};
  const data = input ?? {};

  if (typeof data.month !== 'string' || !MONTH_PATTERN.test(data.month)) {
    errors.month = 'Month must be in YYYY-MM format';
  }

  const category = getCategory(data.categoryId);
  if (!category) {
    errors.categoryId = 'Unknown category';
  } else if (category.type !== 'expense') {
    errors.categoryId = 'Budgets can only be set for expense categories';
  }

  if (!Number.isInteger(data.amountCents) || data.amountCents <= 0) {
    errors.amountCents = 'Amount must be a positive number of cents';
  }

  return errors;
}
