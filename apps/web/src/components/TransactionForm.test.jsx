import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import TransactionForm from './TransactionForm.jsx';

// The budget warning talks to the API; these tests are about the form itself.
vi.mock('../hooks/useBudgetWarning.js', () => ({ useBudgetWarning: () => null }));

const saved = {
  id: 't1',
  type: 'expense',
  amountCents: 899,
  categoryId: 'dining',
  date: '2026-11-03',
  note: 'Lunch',
};

let user;

beforeEach(() => {
  user = userEvent.setup();
});

async function fillAmount(value) {
  const amount = screen.getByLabelText(/Amount/);
  await user.clear(amount);
  await user.type(amount, value);
}

describe('TransactionForm', () => {
  test('submits a new expense in cents and resets the amount', async () => {
    const onSubmit = vi.fn();
    render(<TransactionForm onSubmit={onSubmit} />);
    await fillAmount('12.50');
    await user.selectOptions(screen.getByLabelText('Category'), 'transport');
    await user.clear(screen.getByLabelText(/Date/));
    await user.type(screen.getByLabelText(/Date/), '2026-11-20');
    await user.type(screen.getByLabelText('Note'), '  Bus pass  ');
    await user.click(screen.getByRole('button', { name: 'Add transaction' }));

    expect(onSubmit).toHaveBeenCalledWith({
      type: 'expense',
      amountCents: 1250,
      categoryId: 'transport',
      date: '2026-11-20',
      note: 'Bus pass',
      repeat: 'none',
    });
    expect(screen.getByLabelText(/Amount/)).toHaveValue(null);
    // The category is kept for the next entry.
    expect(screen.getByLabelText('Category')).toHaveValue('transport');
  });

  test('switching to income offers income categories', async () => {
    render(<TransactionForm onSubmit={vi.fn()} />);
    await user.click(screen.getByRole('radio', { name: 'Income' }));
    expect(screen.getByLabelText('Category')).toHaveValue('salary');
    expect(screen.queryByRole('option', { name: 'Groceries' })).not.toBeInTheDocument();
  });

  test('does not submit without an amount and says why', async () => {
    const onSubmit = vi.fn();
    render(<TransactionForm onSubmit={onSubmit} />);
    await user.click(screen.getByRole('button', { name: 'Add transaction' }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Amount/)).toHaveAccessibleDescription('Enter an amount above zero');
  });

  test('passes the repeat choice for new transactions', async () => {
    const onSubmit = vi.fn();
    render(<TransactionForm onSubmit={onSubmit} />);
    await fillAmount('15.99');
    await user.selectOptions(screen.getByLabelText('Repeat'), 'monthly');
    await user.click(screen.getByRole('button', { name: 'Add transaction' }));
    expect(onSubmit.mock.calls[0][0].repeat).toBe('monthly');
    expect(screen.getByLabelText('Repeat')).toHaveValue('none');
  });

  test('edits an existing transaction without a repeat option', async () => {
    const onSubmit = vi.fn();
    render(<TransactionForm initial={saved} onSubmit={onSubmit} />);
    expect(screen.queryByLabelText('Repeat')).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/)).toHaveValue(8.99);
    await fillAmount('9.50');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSubmit).toHaveBeenCalledWith({
      type: 'expense',
      amountCents: 950,
      categoryId: 'dining',
      date: '2026-11-03',
      note: 'Lunch',
    });
  });

  test('shows a server error and keeps the input', async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error('Server is down'));
    render(<TransactionForm onSubmit={onSubmit} />);
    await fillAmount('5');
    await user.click(screen.getByRole('button', { name: 'Add transaction' }));
    expect(await screen.findByText('Server is down')).toBeInTheDocument();
    expect(screen.getByLabelText(/Amount/)).toHaveValue(5);
  });
});
