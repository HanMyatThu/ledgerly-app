import { getCategory } from '@ledgerly/shared';

const ICONS = {
  groceries: '🛒',
  dining: '🍽️',
  transport: '🚌',
  housing: '🏠',
  utilities: '💡',
  health: '🩺',
  entertainment: '🎬',
  shopping: '🛍️',
  'other-expense': '💸',
  salary: '💼',
  freelance: '🧑‍💻',
  'other-income': '💰',
};

export default function CategoryIcon({ categoryId }) {
  const label = getCategory(categoryId)?.label ?? categoryId;
  return (
    <span className="category-icon" role="img" aria-label={label} title={label}>
      {ICONS[categoryId] ?? '•'}
    </span>
  );
}
