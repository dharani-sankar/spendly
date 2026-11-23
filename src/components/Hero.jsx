import { useEffect, useRef, useState } from 'react';
import { Area, ComposedChart, Line, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Pencil } from 'lucide-react';
import { monthLong, todayISO } from '../lib/format';

const INK = '#141A2E';
const reduceMotion =
  typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

function PaceTooltip({ active, payload, label, money }) {
  if (!active || !payload?.length) return null;
  const spent = payload.find((p) => p.dataKey === 'spent')?.value;
  const pace = payload.find((p) => p.dataKey === 'pace')?.value;
  return (
    <div className="tip">
      <strong>Day {label}</strong>
      {spent != null && <span>Spent {money(spent)}</span>}
      {pace != null && <span>Budget pace {money(pace)}</span>}
    </div>
  );
}

export default function Hero({ monthKey, spent, budget, onBudget, series, money, compact }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const { data, dim, lastDay } = series;
  const today = todayISO();
  const nowKey = today.slice(0, 7);
  const isCurrent = monthKey === nowKey;
  const isFuture = monthKey > nowKey;
  const name = monthLong(monthKey);

  const remaining = budget - spent;
  const daysLeft = isCurrent ? dim - lastDay + 1 : 0;
  const expected = budget > 0 && isCurrent ? (budget * lastDay) / dim : 0;
  const paceGap = Math.round(expected - spent); // positive means under pace
  const tolerance = budget * 0.01;

  // ---- Copy: say where the person stands in plain words ----
  let title;
  let sub;
  if (!budget) {
    title = spent ? `You've spent ${money(spent)} in ${name}.` : `Nothing spent in ${name} yet.`;
    sub = 'Set a monthly budget to see how you are pacing.';
  } else if (isFuture && spent === 0) {
    title = `${money(budget)} planned for ${name}.`;
    sub = 'Nothing has been spent yet.';
  } else if (isCurrent) {
    if (remaining >= 0) {
      title = `${money(remaining)} left to spend this month.`;
      const perDay = Math.floor(remaining / daysLeft);
      const paceText =
        paceGap > tolerance
          ? `You are ${money(paceGap)} under pace.`
          : paceGap < -tolerance
            ? `You are ${money(-paceGap)} over pace.`
            : 'You are right on pace.';
      sub = `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} to go, about ${money(perDay)} a day. ${paceText}`;
    } else {
      title = `You are ${money(-remaining)} over budget this month.`;
      sub = `Spending has passed your ${money(budget)} budget.`;
    }
  } else {
    title =
      remaining >= 0
        ? `You finished ${name} ${money(remaining)} under budget.`
        : `You finished ${name} ${money(-remaining)} over budget.`;
    sub = `You spent ${money(spent)} of ${money(budget)}.`;
  }

  const maxSpent = Math.max(0, ...data.map((d) => d.spent ?? 0));
  const yMax = Math.max(budget, maxSpent, 1) * 1.08;
  const ticks = [...new Set([1, 8, 15, 22, dim])];
  const spentToday = lastDay >= 1 ? data[lastDay - 1].spent : null;

  const startEdit = () => {
    setDraft(String(budget || ''));
    setEditing(true);
  };
  const saveBudget = (e) => {
    e.preventDefault();
    const value = Number(draft);
    if (Number.isFinite(value) && value >= 0) {
      onBudget(Math.round(value));
      setEditing(false);
    }
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h2 id="hero-title" className="hero-title">
          {title}
        </h2>
        <p className="hero-sub">{sub}</p>

        <div className="budget">
          {editing ? (
            <form className="budget-form" onSubmit={saveBudget}>
              <label htmlFor="budget-input">Monthly budget</label>
              <input
                id="budget-input"
                ref={inputRef}
                type="number"
                inputMode="decimal"
                min="0"
                step="100"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit" className="btn btn-small btn-dark">
                Save budget
              </button>
              <button type="button" className="btn btn-small btn-outline" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </form>
          ) : (
            <button className="budget-view" onClick={startEdit}>
              <span>Monthly budget</span>
              <strong>{budget ? money(budget) : 'Not set'}</strong>
              <Pencil size={14} aria-hidden="true" />
              <span className="sr-only">Edit monthly budget</span>
            </button>
          )}
        </div>
      </div>

      <div className="hero-chart">
        <div
          className="chart"
          role="img"
          aria-label={`Cumulative spending for ${name} compared with an even budget pace`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 14, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="spentFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={INK} stopOpacity="0.26" />
                  <stop offset="100%" stopColor={INK} stopOpacity="0" />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="day"
                type="number"
                domain={[1, dim]}
                ticks={ticks}
                tickLine={false}
                axisLine={{ stroke: 'rgba(20,26,46,0.25)' }}
                tick={{ fill: 'rgba(20,26,46,0.72)', fontSize: 12 }}
                tickMargin={8}
              />
              <YAxis hide domain={[0, yMax]} />
              <Tooltip
                content={<PaceTooltip money={money} />}
                cursor={{ stroke: 'rgba(20,26,46,0.35)', strokeDasharray: '3 3' }}
              />
              {budget > 0 && (
                <Line
                  dataKey="pace"
                  type="linear"
                  stroke={INK}
                  strokeOpacity={0.5}
                  strokeWidth={1.75}
                  strokeDasharray="6 6"
                  dot={false}
                  activeDot={false}
                  isAnimationActive={false}
                />
              )}
              <Area
                dataKey="spent"
                type="monotone"
                stroke={INK}
                strokeWidth={2.75}
                fill="url(#spentFill)"
                connectNulls={false}
                dot={false}
                activeDot={{ r: 4, fill: INK, stroke: '#CBBEF3', strokeWidth: 2 }}
                isAnimationActive={!reduceMotion}
                animationDuration={1100}
                animationEasing="ease-out"
              />
              {isCurrent && spentToday != null && (
                <ReferenceDot x={lastDay} y={spentToday} r={6} fill="#F2B01E" stroke={INK} strokeWidth={2} />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="legend">
          <span className="legend-item">
            <i className="key-line" aria-hidden="true" />
            Spent so far
          </span>
          {budget > 0 && (
            <span className="legend-item">
              <i className="key-dash" aria-hidden="true" />
              Even pace to {compact(budget)}
            </span>
          )}
          {isCurrent && (
            <span className="legend-item">
              <i className="key-dot" aria-hidden="true" />
              Today
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
