import { useState } from 'react';
import { categoriesFor, toCents, validateBudget } from '@ledgerly/shared';
import Button from './Button.jsx';
import Card from './Card.jsx';
import SelectField from './SelectField.jsx';
import TextField from './TextField.jsx';

const OPTIONS = categoriesFor('expense').map((category) => ({ value: category.id, label: category.label }));

// Sets a monthly limit for one expense category. Saving an existing
// category replaces its limit.
export default function BudgetForm({ month, onSubmit }) {
  const [categoryId, setCategoryId] = useState(OPTIONS[0].value);
  const [amount, setAmount] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    const data = { month, categoryId, amountCents: toCents(amount) };
    const found = validateBudget(data);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await onSubmit(data);
      setAmount('');
    } catch (err) {
      setErrors(err.details ?? { form: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card as="form" className="budget-form" onSubmit={handleSubmit} noValidate>
      <SelectField
        label="Category"
        options={OPTIONS}
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        error={errors.categoryId}
      />
      <TextField
        label="Monthly limit"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        error={errors.amountCents && 'Enter an amount above zero'}
      />
      <Button type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Set budget'}
      </Button>
      {errors.form && <p className="error budget-form-error">{errors.form}</p>}
    </Card>
  );
}
