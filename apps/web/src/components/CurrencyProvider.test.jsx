import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { CurrencyProvider, useMoney } from './CurrencyProvider.jsx';
import CurrencySelect from './CurrencySelect.jsx';

function Price({ cents }) {
  const money = useMoney();
  return <output>{money(cents)}</output>;
}

function renderWithSetting() {
  return render(
    <CurrencyProvider>
      <CurrencySelect />
      <Price cents={123456} />
    </CurrencyProvider>,
  );
}

afterEach(() => localStorage.clear());

describe('currency setting', () => {
  test('formats in US dollars by default, even without a provider', () => {
    render(<Price cents={1250} />);
    expect(screen.getByRole('status')).toHaveTextContent('$12.50');
  });

  test('changes the currency amounts are shown in', async () => {
    renderWithSetting();
    await userEvent.selectOptions(screen.getByLabelText('Currency'), 'EUR');
    expect(screen.getByRole('status')).toHaveTextContent('€1,234.56');
  });

  test('remembers the choice', async () => {
    const { unmount } = renderWithSetting();
    await userEvent.selectOptions(screen.getByLabelText('Currency'), 'GBP');
    unmount();
    renderWithSetting();
    expect(screen.getByLabelText('Currency')).toHaveValue('GBP');
    expect(screen.getByRole('status')).toHaveTextContent('£1,234.56');
  });

  test('ignores an unknown saved currency', () => {
    localStorage.setItem('ledgerly-currency', 'XYZ');
    renderWithSetting();
    expect(screen.getByLabelText('Currency')).toHaveValue('USD');
  });
});
