import { shiftMonth, todayISO, uid } from './format';

// Sample entries so the app looks alive on first visit. Every entry is flagged
// `demo: true` so "Clear sample data" removes only these.

const MONTHLY = [
  { day: 1, type: 'income', category: 'salary', amount: 85000, note: 'Monthly salary' },
  { day: 1, type: 'expense', category: 'rent', amount: 22000, note: 'Apartment rent' },
  { day: 2, type: 'expense', category: 'food', amount: 640, note: 'Breakfast and coffee' },
  { day: 3, type: 'expense', category: 'bills', amount: 1850, note: 'Electricity bill' },
  { day: 4, type: 'expense', category: 'bills', amount: 799, note: 'Broadband' },
  { day: 5, type: 'expense', category: 'transport', amount: 1200, note: 'Metro card recharge' },
  { day: 6, type: 'expense', category: 'food', amount: 1450, note: 'Groceries' },
  { day: 7, type: 'expense', category: 'entertainment', amount: 649, note: 'Movie night' },
  { day: 8, type: 'expense', category: 'shopping', amount: 2399, note: 'Running shoes' },
  { day: 9, type: 'expense', category: 'food', amount: 520, note: 'Lunch with the team' },
  { day: 11, type: 'expense', category: 'health', amount: 850, note: 'Pharmacy' },
  { day: 12, type: 'expense', category: 'transport', amount: 380, note: 'Cab ride' },
  { day: 13, type: 'expense', category: 'food', amount: 1180, note: 'Groceries' },
  { day: 15, type: 'expense', category: 'entertainment', amount: 1200, note: 'Concert tickets' },
  { day: 16, type: 'expense', category: 'education', amount: 2999, note: 'Online course' },
  { day: 17, type: 'expense', category: 'shopping', amount: 1599, note: 'T-shirts' },
  { day: 18, type: 'income', category: 'freelance', amount: 12000, note: 'Logo design project' },
  { day: 19, type: 'expense', category: 'food', amount: 780, note: 'Dinner out' },
  { day: 21, type: 'expense', category: 'transport', amount: 600, note: 'Fuel' },
  { day: 22, type: 'expense', category: 'bills', amount: 499, note: 'Mobile recharge' },
  { day: 24, type: 'expense', category: 'food', amount: 1320, note: 'Groceries' },
  { day: 26, type: 'expense', category: 'travel', amount: 4500, note: 'Weekend trip' },
  { day: 28, type: 'expense', category: 'other', amount: 300, note: 'Gift card and wrapping' },
];

// Oldest month first. Makes each month's total a little different.
const WOBBLE = [1.08, 0.97, 1.12, 0.94, 1.06, 1];

export const DEFAULT_BUDGET = 50000;

export function buildSeed() {
  const today = todayISO();
  const thisMonth = today.slice(0, 7);
  const todayDay = Number(today.slice(8));
  const out = [];
  let createdAt = Date.now();

  WOBBLE.forEach((wobble, i) => {
    const key = shiftMonth(thisMonth, i - (WOBBLE.length - 1));
    const isCurrent = key === thisMonth;
    MONTHLY.forEach((t) => {
      if (isCurrent && t.day > todayDay) return; // no entries in the future
      // Recurring income and rent stay fixed; everything else varies by month.
      const fixed = t.category === 'salary' || t.category === 'rent';
      const amount = fixed ? t.amount : Math.round((t.amount * wobble) / 10) * 10;
      // Freelance work only lands in some months.
      if (t.category === 'freelance' && i % 2 === 1) return;
      out.push({
        id: uid(),
        type: t.type,
        category: t.category,
        amount,
        note: t.note,
        date: `${key}-${String(Math.min(t.day, 28)).padStart(2, '0')}`,
        createdAt: createdAt--,
        demo: true,
      });
    });
  });
  return out;
}
