import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import Amount from './Amount.jsx';

// A first component test, to show the setup works.
describe('Amount', () => {
  test('formats cents as money with the type as a class', () => {
    render(<Amount cents={1250} type="expense" signed />);
    const amount = screen.getByText('−$12.50');
    expect(amount).toHaveClass('amount', 'expense');
  });
});
