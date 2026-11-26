import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';
import TransactionList from './TransactionList.jsx';

const transactions = [
  { id: 'a', type: 'expense', amountCents: 899, categoryId: 'dining', date: '2026-11-26', note: 'Lunch' },
  { id: 'b', type: 'income', amountCents: 250000, categoryId: 'salary', date: '2026-11-26', note: '' },
  {
    id: 'c',
    type: 'expense',
    amountCents: 1200,
    categoryId: 'transport',
    date: '2026-11-20',
    note: '',
    recurringId: 'r1',
  },
];

// Rows link to the Recurring page, so they need a router.
function renderList(props) {
  return render(
    <MemoryRouter>
      <TransactionList transactions={transactions} onEdit={vi.fn()} onDelete={vi.fn()} {...props} />
    </MemoryRouter>,
  );
}

// Fix "today" so relative dates such as "Today" do not depend on when tests run.
beforeAll(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 26, 12));
});

afterAll(() => vi.useRealTimers());

describe('TransactionList', () => {
  test('shows one row per transaction with category, note and signed amount', () => {
    renderList();
    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    expect(within(rows[0]).getByText('Dining out')).toBeInTheDocument();
    expect(within(rows[0]).getByText(/Lunch/)).toBeInTheDocument();
    expect(within(rows[0]).getByText('−$8.99')).toHaveClass('expense');
    expect(within(rows[1]).getByText('+$2,500.00')).toHaveClass('income');
  });

  test('shows the date on each row when not grouped', () => {
    renderList();
    expect(screen.getAllByText('Today')).toHaveLength(2);
  });

  test('groups rows under a header per day with the day total', () => {
    renderList({ groupByDay: true });
    const today = screen.getByRole('region', { name: 'Today' });
    expect(within(today).getAllByRole('listitem')).toHaveLength(2);
    expect(within(today).getByRole('heading')).toHaveTextContent('+$2,491.01');
    const earlier = screen.getByRole('region', { name: 'Fri, Nov 20' });
    expect(within(earlier).getByRole('heading')).toHaveTextContent('−$12.00');
  });

  test('marks transactions added by a recurring rule', () => {
    renderList();
    const badges = screen.getAllByRole('link', { name: /Repeats/ });
    expect(badges).toHaveLength(1);
    expect(badges[0]).toHaveAttribute('href', '/recurring');
  });

  test('edit and delete act on their own row', async () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    renderList({ onEdit, onDelete });
    const row = screen.getAllByRole('listitem')[2];
    await userEvent.click(within(row).getByRole('button', { name: 'Edit' }));
    await userEvent.click(within(row).getByRole('button', { name: 'Delete' }));
    expect(onEdit).toHaveBeenCalledWith(transactions[2]);
    expect(onDelete).toHaveBeenCalledWith('c');
  });

  test('hides the edit button without onEdit', () => {
    renderList({ onEdit: undefined });
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
  });

  test('explains an empty list, differently when filtered', () => {
    const { rerender } = renderList({ transactions: [] });
    expect(screen.getByText('No transactions yet')).toBeInTheDocument();
    rerender(
      <MemoryRouter>
        <TransactionList transactions={[]} onDelete={vi.fn()} filtered />
      </MemoryRouter>,
    );
    expect(screen.getByText('No matching transactions')).toBeInTheDocument();
  });
});
