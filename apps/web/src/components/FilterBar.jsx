import SelectField from './SelectField.jsx';

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'expense', label: 'Expenses' },
  { value: 'income', label: 'Income' },
];

// Controls that narrow the transaction list. `filters` holds the current
// values and `onChange` receives the next filters object.
export default function FilterBar({ filters, onChange }) {
  const update = (field, value) => onChange({ ...filters, [field]: value });

  return (
    <div className="filter-bar" role="search" aria-label="Filter transactions">
      <SelectField
        label="Type"
        options={TYPE_OPTIONS}
        value={filters.type ?? ''}
        onChange={(e) => update('type', e.target.value || undefined)}
      />
    </div>
  );
}
