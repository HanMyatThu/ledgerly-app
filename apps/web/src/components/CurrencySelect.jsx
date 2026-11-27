import { CURRENCIES, useCurrency } from './CurrencyProvider.jsx';

// The display currency setting, shown in the footer.
export default function CurrencySelect() {
  const { currency, setCurrency } = useCurrency();
  return (
    <label className="currency-select" title="Changes how amounts are shown. Amounts are not converted.">
      Currency
      <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
        {CURRENCIES.map((item) => (
          <option key={item.code} value={item.code}>
            {item.label}
          </option>
        ))}
      </select>
    </label>
  );
}
