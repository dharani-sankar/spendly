import { getCategory } from './constants';
import { daysInMonth, monthOf, monthShort, shiftMonth, todayISO } from './format';

export const inMonth = (txs, key) => txs.filter((t) => monthOf(t.date) === key);

export function totals(txs) {
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.type === 'income') income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, kept: income - expense };
}

// Expense totals per category, largest first.
export function breakdown(txs) {
  const sums = new Map();
  let total = 0;
  for (const t of txs) {
    if (t.type !== 'expense') continue;
    sums.set(t.category, (sums.get(t.category) ?? 0) + t.amount);
    total += t.amount;
  }
  return [...sums]
    .map(([id, value]) => ({ ...getCategory(id), value, share: total ? value / total : 0 }))
    .sort((a, b) => b.value - a.value);
}

// Cumulative spending for each day of the month, next to an even-pace budget line.
// `spent` is null for days that have not happened yet.
export function paceSeries(key, txs, budget) {
  const dim = daysInMonth(key);
  const today = todayISO();
  const nowKey = today.slice(0, 7);
  const lastDay = key === nowKey ? Number(today.slice(8)) : key < nowKey ? dim : 0;

  const perDay = Array(dim + 1).fill(0);
  for (const t of txs) {
    if (t.type === 'expense' && monthOf(t.date) === key) perDay[Number(t.date.slice(8))] += t.amount;
  }

  let running = 0;
  const data = [];
  for (let day = 1; day <= dim; day++) {
    running += perDay[day];
    data.push({
      day,
      spent: day <= lastDay ? Math.round(running * 100) / 100 : null,
      pace: budget > 0 ? Math.round(((budget * day) / dim) * 100) / 100 : null,
    });
  }
  return { data, dim, lastDay };
}

// Income and spending for the `count` months ending at `key`.
export function history(key, txs, count = 6) {
  return Array.from({ length: count }, (_, i) => {
    const k = shiftMonth(key, i - (count - 1));
    return { key: k, label: monthShort(k), ...totals(inMonth(txs, k)) };
  });
}
