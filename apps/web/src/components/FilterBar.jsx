// Controls that narrow the transaction list. `filters` holds the current
// values and `onChange` receives the next filters object.
export default function FilterBar({ filters, onChange }) {
  // eslint-disable-next-line no-unused-vars
  const update = (field, value) => onChange({ ...filters, [field]: value });

  return <div className="filter-bar" role="search" aria-label="Filter transactions"></div>;
}
