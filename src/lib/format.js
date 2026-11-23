const pad = (n) => String(n).padStart(2, '0');

// ---- Dates -----------------------------------------------------------------
// Dates are stored as plain "YYYY-MM-DD" strings so time zones never shift an entry.

export const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const todayISO = () => toISO(new Date());
export const parseISO = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const monthOf = (iso) => iso.slice(0, 7);

export const shiftMonth = (key, delta) => {
  const [y, m] = key.split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
};

export const daysInMonth = (key) => {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};

export const monthLong = (key) => parseISO(`${key}-01`).toLocaleDateString('en-US', { month: 'long' });
export const monthShort = (key) => parseISO(`${key}-01`).toLocaleDateString('en-US', { month: 'short' });
export const monthYear = (key) =>
  parseISO(`${key}-01`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

export function dayHeading(iso) {
  if (iso === todayISO()) return 'Today';
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (iso === toISO(yesterday)) return 'Yesterday';
  return parseISO(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

// ---- Money -----------------------------------------------------------------

export function makeFormatters(currency) {
  const base = { style: 'currency', currency: currency.code };
  const whole = new Intl.NumberFormat(currency.locale, { ...base, maximumFractionDigits: 0 });
  const exact = new Intl.NumberFormat(currency.locale, {
    ...base,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const compactNf = new Intl.NumberFormat(currency.locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  });

  // Whole amounts show without decimals; anything else shows two decimals.
  const money = (n) => {
    const v = Math.round(n * 100) / 100;
    return Number.isInteger(v) ? whole.format(v) : exact.format(v);
  };
  const compact = (n) => compactNf.format(n);
  return { money, compact };
}

// ---- Misc ------------------------------------------------------------------

export const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

// ---- CSV export ------------------------------------------------------------

// Cells that start with = + - @ can run as formulas in Excel, so they get a leading apostrophe.
const safeCell = (value) => {
  const text = String(value ?? '');
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
};

export function toCSV(transactions, labelOf) {
  const rows = [['Date', 'Type', 'Category', 'Amount', 'Note']];
  [...transactions]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((t) => rows.push([t.date, t.type, labelOf(t.category), t.amount.toFixed(2), safeCell(t.note)]));
  return rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\r\n');
}

export function downloadText(filename, text) {
  const blob = new Blob(['﻿' + text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
