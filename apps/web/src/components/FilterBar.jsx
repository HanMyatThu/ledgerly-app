import { useEffect, useState } from 'react';
import { CATEGORIES } from '@ledgerly/shared';
import { useDebounce } from '../hooks/useDebounce.js';
import Button from './Button.jsx';
import SelectField from './SelectField.jsx';
import TextField from './TextField.jsx';

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
export function hasActiveFilters(filters) {
  return Boolean(filters.type || filters.category || filters.q);
}

export default function FilterBar({ filters, onChange }) {
  const update = (field, value) => onChange({ ...filters, [field]: value });

  // Typing updates the box right away but only searches once typing pauses.
  const [search, setSearch] = useState(filters.q ?? '');
  const debouncedSearch = useDebounce(search.trim(), 300);

  useEffect(() => {
    if (debouncedSearch !== (filters.q ?? '')) update('q', debouncedSearch || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Keep the box in sync when filters change from outside, e.g. when cleared.
  useEffect(() => {
    if ((filters.q ?? '') !== search.trim()) setSearch(filters.q ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q]);

  function changeType(type) {
    const next = { ...filters, type };
    // Drop a category that does not belong to the new type.
    const category = CATEGORIES.find((item) => item.id === filters.category);
    if (type && category && category.type !== type) next.category = undefined;
    onChange(next);
  }

  return (
    <div className="filter-bar" role="search" aria-label="Filter transactions">
      <TextField
        label="Search notes"
        type="search"
        placeholder="e.g. coffee"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
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
      {hasActiveFilters(filters) && (
        <Button variant="ghost" className="filter-bar-clear" onClick={() => onChange({ sort: filters.sort })}>
          Clear filters
        </Button>
      )}
    </div>
  );
}
