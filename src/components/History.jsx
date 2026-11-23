import { monthYear } from '../lib/format';

export default function History({ months, activeKey, budget, onPick, money, compact }) {
  const peak = Math.max(...months.map((m) => m.expense), budget, 1);
  const budgetAt = budget > 0 ? (budget / peak) * 100 : null;

  return (
    <section className="section" aria-labelledby="history-title">
      <div className="section-head">
        <h3 id="history-title" className="section-title">
          Month by month
        </h3>
        <p className="section-sub">
          Spending over the last six months
          {budgetAt !== null ? '. The dashed line is your budget.' : ''}
        </p>
      </div>

      <div className="history">
        {budgetAt !== null && (
          <div className="budget-mark" style={{ '--at': budgetAt / 100 }} aria-hidden="true" />
        )}
        <ul className="bars">
          {months.map((m) => {
            const height = m.expense > 0 ? Math.max((m.expense / peak) * 100, 3) : 0;
            const over = budget > 0 && m.expense > budget;
            const active = m.key === activeKey;
            return (
              <li key={m.key}>
                <button
                  className={`bar-col ${active ? 'is-active' : ''} ${over ? 'is-over' : ''}`}
                  onClick={() => onPick(m.key)}
                  aria-pressed={active}
                  aria-label={`${monthYear(m.key)}: spent ${money(m.expense)}`}
                  title={`${monthYear(m.key)}: ${money(m.expense)}`}
                >
                  <span className="bar-val">{m.expense > 0 ? compact(m.expense) : ''}</span>
                  <span className="bar-track">
                    <span className="bar" style={{ height: `${height}%` }} />
                  </span>
                  <span className="bar-label">{m.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
