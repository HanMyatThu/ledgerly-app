import { useState } from 'react';
import { categoriesFor, toCents, validateTransaction } from '@ledgerly/shared';
import Button from './Button.jsx';
import Card from './Card.jsx';

function today() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = () => ({ type: 'expense', amount: '', categoryId: 'groceries', date: today(), note: '' });

export default function TransactionForm({ onSubmit }) {
  const [form, setForm] = useState(emptyForm);
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
      setForm({ ...emptyForm(), type: form.type, categoryId: form.categoryId });
    } catch (err) {
      setErrors(err.details ?? { form: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card as="form" className="transaction-form" onSubmit={handleSubmit} noValidate>
      <div className="type-toggle" role="radiogroup" aria-label="Type">
        {['expense', 'income'].map((type) => (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={form.type === type}
            className={form.type === type ? 'active' : ''}
            onClick={() => update('type', type)}
          >
            {type === 'expense' ? 'Expense' : 'Income'}
          </button>
        ))}
      </div>

      <label>
        Amount
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => update('amount', e.target.value)}
        />
        {errors.amountCents && <span className="field-error">Enter an amount above zero</span>}
      </label>

      <label>
        Category
        <select value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)}>
          {categoriesFor(form.type).map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        Date
        <input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
        {errors.date && <span className="field-error">{errors.date}</span>}
      </label>

      <label className="wide">
        Note
        <input type="text" maxLength={200} value={form.note} onChange={(e) => update('note', e.target.value)} />
      </label>

      {errors.form && <p className="error wide">{errors.form}</p>}

      <Button type="submit" className="wide" disabled={saving}>
        {saving ? 'Saving…' : 'Add transaction'}
      </Button>
    </Card>
  );
}
