import { useState } from 'react';
import { categoriesFor, toCents, validateTransaction } from '@ledgerly/shared';
import Button from './Button.jsx';
import Card from './Card.jsx';
import SegmentedControl from './SegmentedControl.jsx';
import SelectField from './SelectField.jsx';
import TextField from './TextField.jsx';

function today() {
  return new Date().toISOString().slice(0, 10);
}

const TYPE_OPTIONS = [
  { value: 'expense', label: 'Expense' },
  { value: 'income', label: 'Income' },
];

const emptyForm = () => ({ type: 'expense', amount: '', categoryId: 'groceries', date: today(), note: '' });

// Turns a saved transaction into form fields.
function toForm(transaction) {
  return {
    type: transaction.type,
    amount: (transaction.amountCents / 100).toFixed(2),
    categoryId: transaction.categoryId,
    date: transaction.date,
    note: transaction.note ?? '',
  };
}

// Pass `initial` to edit an existing transaction; otherwise the form adds a new one.
export default function TransactionForm({ onSubmit, initial, submitLabel }) {
  const [form, setForm] = useState(() => (initial ? toForm(initial) : emptyForm()));
  const label = submitLabel ?? (initial ? 'Save changes' : 'Add transaction');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function update(field, value) {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'type') next.categoryId = categoriesFor(value)[0].id;
      return next;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      type: form.type,
      amountCents: toCents(form.amount),
      categoryId: form.categoryId,
      date: form.date,
      note: form.note.trim(),
    };
    const found = validateTransaction(payload);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await onSubmit(payload);
      if (!initial) setForm({ ...emptyForm(), type: form.type, categoryId: form.categoryId });
    } catch (err) {
      setErrors(err.details ?? { form: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card as="form" className="transaction-form" onSubmit={handleSubmit} noValidate>
      <SegmentedControl
        label="Type"
        className="wide"
        options={TYPE_OPTIONS}
        value={form.type}
        onChange={(type) => update('type', type)}
      />

      <TextField
        label="Amount"
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        value={form.amount}
        onChange={(e) => update('amount', e.target.value)}
        error={errors.amountCents && 'Enter an amount above zero'}
      />

      <SelectField
        label="Category"
        value={form.categoryId}
        onChange={(e) => update('categoryId', e.target.value)}
        options={categoriesFor(form.type).map((category) => ({ value: category.id, label: category.label }))}
      />

      <TextField
        label="Date"
        type="date"
        value={form.date}
        onChange={(e) => update('date', e.target.value)}
        error={errors.date}
      />

      <TextField
        label="Note"
        className="wide"
        type="text"
        maxLength={200}
        value={form.note}
        onChange={(e) => update('note', e.target.value)}
      />

      {errors.form && <p className="error wide">{errors.form}</p>}

      <Button type="submit" className="wide" disabled={saving}>
        {saving ? 'Saving…' : label}
      </Button>
    </Card>
  );
}
