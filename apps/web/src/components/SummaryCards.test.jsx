import { render, screen, within } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import SummaryCards from './SummaryCards.jsx';

const summary = {
  incomeCents: 400000,
  expenseCents: 165000,
  balanceCents: 235000,
  averageDailySpendCents: 8250,
  previous: { incomeChangePercent: -2, expenseChangePercent: 10 },
};

function card(name) {
  return screen.getByText(name).closest('.card');
}

describe('SummaryCards', () => {
  test('shows income, expenses and balance under a labelled section', () => {
    render(<SummaryCards summary={summary} label="Totals for November 2026" />);
    expect(screen.getByRole('region', { name: 'Totals for November 2026' })).toBeInTheDocument();
    expect(within(card('Income')).getByText('$4,000.00')).toHaveClass('income');
    expect(within(card('Expenses')).getByText('$1,650.00')).toHaveClass('expense');
    expect(within(card('Balance')).getByText('$2,350.00')).toBeInTheDocument();
  });

  test('shows a negative balance as an expense', () => {
    render(<SummaryCards summary={{ ...summary, balanceCents: -500 }} />);
    expect(within(card('Balance')).getByText('-$5.00')).toHaveClass('expense');
  });

  test('colors trends by whether the change is good news', () => {
    render(<SummaryCards summary={summary} />);
    // Income fell: bad. Expenses rose: also bad.
    expect(within(card('Income')).getByText(/2% vs last month/)).toHaveClass('trend-bad');
    expect(within(card('Expenses')).getByText(/10% vs last month/)).toHaveClass('trend-bad');
  });

  test('shows spending going down as good news', () => {
    render(<SummaryCards summary={{ ...summary, previous: { incomeChangePercent: 5, expenseChangePercent: -8 } }} />);
    expect(within(card('Income')).getByText(/5% vs last month/)).toHaveClass('trend-good');
    expect(within(card('Expenses')).getByText(/8% vs last month/)).toHaveClass('trend-good');
  });

  test('says so when there is nothing to compare with', () => {
    render(
      <SummaryCards summary={{ ...summary, previous: { incomeChangePercent: null, expenseChangePercent: null } }} />,
    );
    expect(screen.getAllByText('No data last month')).toHaveLength(2);
  });

  test('shows the average daily spend only when there is spending', () => {
    const { rerender } = render(<SummaryCards summary={summary} />);
    expect(screen.getByText('$82.50 a day on average')).toBeInTheDocument();
    rerender(<SummaryCards summary={{ ...summary, averageDailySpendCents: 0 }} />);
    expect(screen.queryByText(/a day on average/)).not.toBeInTheDocument();
  });

  test('works without comparison data', () => {
    const { previous: _previous, ...bare } = summary;
    render(<SummaryCards summary={bare} />);
    expect(screen.queryByText(/vs last month/)).not.toBeInTheDocument();
  });
});
