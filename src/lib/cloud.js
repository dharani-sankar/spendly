import { supabase } from './supabase';

// All database calls live here so components never talk to Supabase directly.
// Every function throws on failure; callers decide how to tell the person.

const PAGE = 1000; // Supabase returns at most 1000 rows per request
const CHUNK = 500;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const unwrap = ({ data, error }) => {
  if (error) throw error;
  return data;
};

// Database row -> shape the UI already uses.
const fromRow = (r) => ({
  id: r.id,
  type: r.type,
  category: r.category,
  amount: Number(r.amount),
  note: r.note ?? '',
  date: r.date, // "YYYY-MM-DD" string, same as before
  demo: r.demo,
  createdAt: Date.parse(r.created_at),
});

// UI shape -> database row. A valid uuid id is kept (used when restoring after Undo).
const toRow = (userId, t) => ({
  ...(UUID.test(t.id ?? '') ? { id: t.id } : {}),
  user_id: userId,
  type: t.type,
  category: t.category,
  amount: t.amount,
  note: t.note ?? '',
  date: t.date,
  demo: Boolean(t.demo),
  ...(t.createdAt ? { created_at: new Date(t.createdAt).toISOString() } : {}),
});

export async function fetchTransactions() {
  const rows = [];
  for (let from = 0; ; from += PAGE) {
    const data = unwrap(
      await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, from + PAGE - 1),
    );
    rows.push(...data);
    if (data.length < PAGE) break;
  }
  return rows.map(fromRow);
}

export async function insertTransactions(userId, list) {
  const rows = [];
  for (let i = 0; i < list.length; i += CHUNK) {
    const chunk = list.slice(i, i + CHUNK).map((t) => toRow(userId, t));
    rows.push(...unwrap(await supabase.from('transactions').insert(chunk).select()));
  }
  return rows.map(fromRow);
}

export async function updateTransaction(t) {
  const data = unwrap(
    await supabase
      .from('transactions')
      .update({
        type: t.type,
        category: t.category,
        amount: t.amount,
        note: t.note ?? '',
        date: t.date,
        demo: false, // an edited sample entry becomes a real one
      })
      .eq('id', t.id)
      .select()
      .single(),
  );
  return fromRow(data);
}

export async function deleteTransaction(id) {
  unwrap(await supabase.from('transactions').delete().eq('id', id));
}

export async function deleteSamples() {
  unwrap(await supabase.from('transactions').delete().eq('demo', true));
}

export async function deleteAll(userId) {
  unwrap(await supabase.from('transactions').delete().eq('user_id', userId));
}

export async function fetchSettings() {
  const data = unwrap(await supabase.from('settings').select('budget, currency').maybeSingle());
  return data ? { budget: Number(data.budget), currency: data.currency } : null;
}

export async function saveSettings(userId, patch) {
  unwrap(
    await supabase
      .from('settings')
      .upsert({ user_id: userId, ...patch, updated_at: new Date().toISOString() }),
  );
}
