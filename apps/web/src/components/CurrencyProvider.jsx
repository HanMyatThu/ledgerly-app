import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { formatMoney } from '@ledgerly/shared';

// Currencies offered in the setting. Changing it only changes how amounts are
// shown; stored amounts are not converted.
export const CURRENCIES = [
  { code: 'USD', label: 'US dollar ($)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'GBP', label: 'British pound (£)' },
  { code: 'JPY', label: 'Japanese yen (¥)' },
  { code: 'SGD', label: 'Singapore dollar (S$)' },
  { code: 'THB', label: 'Thai baht (฿)' },
  { code: 'MMK', label: 'Myanmar kyat (K)' },
  { code: 'INR', label: 'Indian rupee (₹)' },
];

const STORAGE_KEY = 'ledgerly-currency';
const DEFAULT = 'USD';

function loadCurrency() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return CURRENCIES.some((item) => item.code === saved) ? saved : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

const CurrencyContext = createContext({ currency: DEFAULT, setCurrency: () => {} });

export function CurrencyProvider({ children }) {
  const [currency, setState] = useState(loadCurrency);

  const setCurrency = useCallback((code) => {
    setState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // Not remembered, but used for this visit.
    }
  }, []);

  const value = useMemo(() => ({ currency, setCurrency }), [currency, setCurrency]);
  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

// A formatter for cents in the chosen currency.
export function useMoney() {
  const { currency } = useCurrency();
  return useCallback((cents) => formatMoney(cents, currency), [currency]);
}
