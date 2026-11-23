import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { categoriesFor } from '../lib/constants';

export default function TransactionModal({ initial, defaultDate, currencySymbol, onSave, onClose }) {
  const editing = Boolean(initial);
  const [type, setType] = useState(initial?.type ?? 'expense');
  const [amount, setAmount] = useState(initial ? String(initial.amount) : '');
  const [category, setCategory] = useState(initial?.category ?? 'food');
  const [date, setDate] = useState(initial?.date ?? defaultDate);
  const [note, setNote] = useState(initial?.note ?? '');
  const [error, setError] = useState('');
  const amountRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  // Runs once on open: focus the amount, close on Escape, lock page scroll.
  useEffect(() => {
    amountRef.current?.focus();
    const onKey = (e) => e.key === 'Escape' && closeRef.current();
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, []);

  const switchType = (next) => {
    setType(next);
    // Keep the category valid for the chosen type.
    if (!categoriesFor(next).some((c) => c.id === category)) setCategory(categoriesFor(next)[0].id);
  };

  const submit = (e) => {
    e.preventDefault();
    const value = Math.round(Number(amount) * 100) / 100;
    if (!Number.isFinite(value) || value <= 0) {
      setError('Enter an amount greater than 0.');
      amountRef.current?.focus();
      return;
    }
    if (value > 1_000_000_000) {
      setError('That amount is too large. Enter a smaller number.');
      amountRef.current?.focus();
      return;
    }
    if (!date) {
      setError('Pick a date for this transaction.');
      return;
    }
    onSave({ id: initial?.id, type, amount: value, category, date, note: note.trim() });
  };

  const noun = type === 'income' ? 'income' : 'expense';

  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <form className="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onSubmit={submit} noValidate>
        <div className="dialog-head">
          <h2 id="dialog-title">{editing ? `Edit ${noun}` : `New ${noun}`}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="seg seg-wide" role="group" aria-label="Transaction type">
          <button type="button" className="seg-btn" aria-pressed={type === 'expense'} onClick={() => switchType('expense')}>
            Expense
          </button>
          <button type="button" className="seg-btn" aria-pressed={type === 'income'} onClick={() => switchType('income')}>
            Income
          </button>
        </div>

        <label className="amount-field">
          <span className="sr-only">Amount</span>
          <span className="amount-symbol" aria-hidden="true">
            {currencySymbol}
          </span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder="0"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setError('');
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'dialog-error' : undefined}
          />
        </label>

        <fieldset className="field">
          <legend>Category</legend>
          <div className="chips">
            {categoriesFor(type).map((c) => {
              const Icon = c.icon;
              return (
                <button
                  type="button"
                  key={c.id}
                  className="chip"
                  style={{ '--c': c.color }}
                  aria-pressed={category === c.id}
                  onClick={() => setCategory(c.id)}
                >
                  <Icon size={16} aria-hidden="true" />
                  {c.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="field-row">
          <label className="field">
            <span className="field-label">Date</span>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </label>
          <label className="field field-grow">
            <span className="field-label">Note (optional)</span>
            <input
              type="text"
              placeholder="What was it for?"
              maxLength={80}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <p id="dialog-error" className="error" role="alert">
            {error}
          </p>
        )}

        <div className="dialog-actions">
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            {editing ? 'Save changes' : `Add ${noun}`}
          </button>
        </div>
      </form>
    </div>
  );
}
