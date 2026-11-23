import { useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { CATEGORIES, getCategory } from '../lib/constants';
import { dayHeading } from '../lib/format';

const PAGE_SIZE = 40;

const TYPES = [
  { id: 'all', label: 'All' },
  { id: 'income', label: 'Income' },
  { id: 'expense', label: 'Spending' },
];

const signed = (type, amount, money) => (type === 'income' ? `+${money(amount)}` : `−${money(amount)}`);

export default function Ledger({
  items,
  filters,
  onFilters,
  monthName,
  monthCount,
  money,
  onEdit,
  onDelete,
  onAdd,
}) {
  const [limit, setLimit] = useState(PAGE_SIZE);

  // Start from the first page again whenever the filters change.
  useEffect(() => setLimit(PAGE_SIZE), [filters]);

  const shown = items.slice(0, limit);

  const groups = useMemo(() => {
    const map = new Map();
    for (const t of shown) {
      if (!map.has(t.date)) map.set(t.date, []);
      map.get(t.date).push(t);
    }
    return [...map].map(([date, rows]) => ({
      date,
      rows,
      net: rows.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, limit]);

  const filtering = filters.query || filters.type !== 'all' || filters.category !== 'all';
  const set = (patch) => onFilters({ ...filters, ...patch });

  return (
    <section className="section ledger" aria-labelledby="ledger-title">
      <div className="section-head">
        <h3 id="ledger-title" className="section-title">
          Ledger
        </h3>
        <p className="section-sub">
          {items.length} {items.length === 1 ? 'entry' : 'entries'}
          {filters.scope === 'all' ? ' across all time' : ` in ${monthName}`}
        </p>
      </div>

      <div className="controls">
        <label className="search">
          <Search size={17} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search notes or categories"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
            aria-label="Search entries"
          />
        </label>

        <div className="seg" role="group" aria-label="Entry type">
          {TYPES.map((t) => (
            <button
              key={t.id}
              className="seg-btn"
              aria-pressed={filters.type === t.id}
              onClick={() => set({ type: t.id })}
            >
              {t.label}
            </button>
          ))}
        </div>

        <select
          className="select"
          value={filters.category}
          onChange={(e) => set({ category: e.target.value })}
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          <optgroup label="Spending">
            {CATEGORIES.filter((c) => c.type === 'expense').map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </optgroup>
          <optgroup label="Income">
            {CATEGORIES.filter((c) => c.type === 'income').map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </optgroup>
        </select>

        <div className="seg" role="group" aria-label="Time range">
          <button className="seg-btn" aria-pressed={filters.scope === 'month'} onClick={() => set({ scope: 'month' })}>
            {monthName}
          </button>
          <button className="seg-btn" aria-pressed={filters.scope === 'all'} onClick={() => set({ scope: 'all' })}>
            All time
          </button>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="empty">
          {filtering ? (
            <>
              <p>No entries match these filters.</p>
              <button
                className="btn btn-outline"
                onClick={() => onFilters({ ...filters, query: '', type: 'all', category: 'all' })}
              >
                Clear filters
              </button>
            </>
          ) : (
            <>
              <p>
                {monthCount === 0
                  ? `Nothing recorded for ${monthName} yet.`
                  : 'Nothing to show here yet.'}
              </p>
              <button className="btn btn-primary" onClick={onAdd}>
                <Plus size={18} aria-hidden="true" />
                Add transaction
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="days">
          {groups.map((g) => (
            <div className="day" key={g.date}>
              <div className="day-head">
                <h4>{dayHeading(g.date)}</h4>
                <span className="day-net">{g.net >= 0 ? `+${money(g.net)}` : `−${money(-g.net)}`}</span>
              </div>
              <ul className="rows">
                {g.rows.map((t) => {
                  const cat = getCategory(t.category);
                  const Icon = cat.icon;
                  return (
                    <li className="row" key={t.id} style={{ '--c': cat.color }}>
                      <span className="swatch">
                        <Icon size={16} aria-hidden="true" />
                      </span>
                      <div className="row-main">
                        <span className="row-note">{t.note || cat.label}</span>
                        {t.note && <span className="row-sub">{cat.label}</span>}
                      </div>
                      <div className="row-actions">
                        <button
                          className="icon-btn icon-btn-small"
                          onClick={() => onEdit(t)}
                          aria-label={`Edit ${t.note || cat.label}`}
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          className="icon-btn icon-btn-small"
                          onClick={() => onDelete(t)}
                          aria-label={`Delete ${t.note || cat.label}`}
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                      <span className={`amount ${t.type === 'income' ? 'is-income' : ''}`}>
                        {signed(t.type, t.amount, money)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {items.length > limit && (
            <button className="btn btn-outline more" onClick={() => setLimit((n) => n + PAGE_SIZE)}>
              Show {Math.min(PAGE_SIZE, items.length - limit)} more
            </button>
          )}
        </div>
      )}
    </section>
  );
}
