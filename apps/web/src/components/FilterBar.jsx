import { CATEGORIES } from '@ledgerly/shared';
import SelectField from './SelectField.jsx';

const TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'expense', label: 'Expenses' },
  { value: 'income', label: 'Income' },
];

// Narrow categories to the chosen type, and label "Other" so the two are distinguishable.
function categoryOptions(type) {
  const categories = type ? CATEGORIES.filter((category) => category.type === type) : CATEGORIES;
  return [
    { value: '', label: 'All categories' },
    ...categories.map((category) => ({
      value: category.id,
      label: !type && category.label === 'Other' ? `Other (${category.type})` : category.label,
    })),
  ];
}

// Controls that narrow the transaction list. `filters` holds the current
// values and `onChange` receives the next filters object.
export default function FilterBar({ filters, onChange }) {
  const update = (field, value) => onChange({ ...filters, [field]: value });

  function changeType(type) {
    const next = { ...filters, type };
    // Drop a category that does not belong to the new type.
    const category = CATEGORIES.find((item) => item.id === filters.category);
    if (type && category && category.type !== type) next.category = undefined;
    onChange(next);
  }

  return (
    <div className="filter-bar" role="search" aria-label="Filter transactions">
      <SelectField
        label="Type"
        options={TYPE_OPTIONS}
        value={filters.type ?? ''}
        onChange={(e) => changeType(e.target.value || undefined)}
      />
      <SelectField
        label="Category"
        options={categoryOptions(filters.type)}
        value={filters.category ?? ''}
        onChange={(e) => update('category', e.target.value || undefined)}
      />
    </div>
  );
}
