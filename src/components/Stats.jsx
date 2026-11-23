import { monthLong, shiftMonth } from '../lib/format';

function compare(current, previous, prevName, money) {
  if (current === 0 && previous === 0) return `Nothing in ${prevName} either`;
  if (previous === 0) return `Nothing recorded in ${prevName}`;
  const diff = current - previous;
  if (Math.abs(diff) < 0.5) return `Same as ${prevName}`;
  return `${money(Math.abs(diff))} ${diff > 0 ? 'more' : 'less'} than ${prevName}`;
}

export default function Stats({ monthKey, now, before, money }) {
  const prevName = monthLong(shiftMonth(monthKey, -1));
  const keptRate = now.income > 0 ? Math.round((now.kept / now.income) * 100) : null;
  const negative = now.kept < 0;

  return (
    <section className="stats" aria-label="Month summary">
      <div className="stat">
        <h3 className="stat-label">Income</h3>
        <p className="stat-value">{money(now.income)}</p>
        <p className="stat-note">{compare(now.income, before.income, prevName, money)}</p>
      </div>
      <div className="stat">
        <h3 className="stat-label">Spent</h3>
        <p className="stat-value">{money(now.expense)}</p>
        <p className="stat-note">{compare(now.expense, before.expense, prevName, money)}</p>
      </div>
      <div className="stat">
        <h3 className="stat-label">Kept</h3>
        <p className={`stat-value ${negative ? 'is-negative' : ''}`}>
          {negative ? '−' : ''}
          {money(Math.abs(now.kept))}
        </p>
        <p className="stat-note">
          {keptRate === null
            ? 'Add income to see your savings rate'
            : negative
              ? `You spent ${Math.abs(keptRate)}% more than you earned`
              : `${keptRate}% of what came in`}
        </p>
      </div>
    </section>
  );
}
