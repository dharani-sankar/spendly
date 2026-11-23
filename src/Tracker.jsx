import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import Header from './components/Header';
import Hero from './components/Hero';
import Stats from './components/Stats';
import Breakdown from './components/Breakdown';
import History from './components/History';
import Ledger from './components/Ledger';
import TransactionModal from './components/TransactionModal';
import Toast from './components/Toast';

import { CURRENCIES, getCategory } from './lib/constants';
import {
  downloadText,
  makeFormatters,
  monthLong,
  monthOf,
  monthYear,
  shiftMonth,
  todayISO,
  toCSV,
} from './lib/format';
import { breakdown, history, inMonth, paceSeries, totals } from './lib/stats';
import { buildSeed, DEFAULT_BUDGET } from './lib/seed';
import { useLocalStorage } from './lib/useLocalStorage';
import * as cloud from './lib/cloud';

const DEFAULT_FILTERS = { query: '', type: 'all', category: 'all', scope: 'month' };

const preferredTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export default function Tracker({ user, onSignOut }) {
  // Transactions, budget and currency live in Supabase. Theme is a per-device preference.
  const [transactions, setTransactions] = useState([]);
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [currencyCode, setCurrencyCode] = useState('INR');
  const [theme, setTheme] = useLocalStorage('spendly:theme', preferredTheme);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'

  const nowKey = todayISO().slice(0, 7);
  const [month, setMonth] = useState(nowKey);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [modal, setModal] = useState(null); // { tx } while the dialog is open
  const [toast, setToast] = useState(null);

  // ---- Load this person's data from Supabase ----
  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const [list, settings] = await Promise.all([cloud.fetchTransactions(), cloud.fetchSettings()]);
      setTransactions(list);
      if (settings) {
        setBudget(settings.budget);
        setCurrencyCode(settings.currency);
      }
      setStatus('ready');
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // ---- Theme + toast plumbing ----
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#0D111D' : '#ECEFF3');
  }, [theme]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = (message, action) => setToast({ message, action });

  // ---- Derived data ----
  const currency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];
  const { money, compact } = useMemo(() => makeFormatters(currency), [currency]);

  const monthTx = useMemo(() => inMonth(transactions, month), [transactions, month]);
  const now = useMemo(() => totals(monthTx), [monthTx]);
  const before = useMemo(
    () => totals(inMonth(transactions, shiftMonth(month, -1))),
    [transactions, month],
  );
  const categories = useMemo(() => breakdown(monthTx), [monthTx]);
  const series = useMemo(() => paceSeries(month, transactions, budget), [month, transactions, budget]);
  const months = useMemo(() => history(month, transactions), [month, transactions]);

  const listItems = useMemo(() => {
    const source = filters.scope === 'all' ? transactions : monthTx;
    const q = filters.query.trim().toLowerCase();
    return source
      .filter((t) => filters.type === 'all' || t.type === filters.type)
      .filter((t) => filters.category === 'all' || t.category === filters.category)
      .filter(
        (t) =>
          !q ||
          (t.note ?? '').toLowerCase().includes(q) ||
          getCategory(t.category).label.toLowerCase().includes(q),
      )
      .sort((a, b) => b.date.localeCompare(a.date) || (b.createdAt ?? 0) - (a.createdAt ?? 0));
  }, [transactions, monthTx, filters]);

  const hasSample = transactions.some((t) => t.demo);

  // ---- Actions ----
  const openAdd = () => setModal({ tx: null });
  const closeModal = () => setModal(null);

  const failed = (err, message) => {
    console.error(err);
    notify(message);
  };

  // Put rows back after an Undo. They keep their original ids and timestamps.
  const restore = async (rows) => {
    try {
      const back = await cloud.insertTransactions(user.id, rows);
      setTransactions((list) => [...back, ...list]);
    } catch (err) {
      failed(err, 'Could not restore. Try again.');
    }
  };

  // Throws on failure so the dialog can stay open and show an error.
  const saveTransaction = async (data) => {
    if (data.id) {
      const saved = await cloud.updateTransaction(data);
      setTransactions((list) => list.map((t) => (t.id === saved.id ? saved : t)));
      notify('Changes saved');
    } else {
      const [saved] = await cloud.insertTransactions(user.id, [data]);
      setTransactions((list) => [saved, ...list]);
      notify(data.type === 'income' ? 'Income added' : 'Expense added');
    }
    setMonth(monthOf(data.date)); // jump to the month the entry belongs to
    setModal(null);
  };

  const deleteTransaction = async (tx) => {
    setTransactions((list) => list.filter((t) => t.id !== tx.id));
    try {
      await cloud.deleteTransaction(tx.id);
    } catch (err) {
      setTransactions((list) => [tx, ...list]);
      failed(err, 'Could not delete that entry. Try again.');
      return;
    }
    notify('Entry deleted', { label: 'Undo', onClick: () => restore([tx]) });
  };

  const exportCsv = () => {
    downloadText(`spendly-${todayISO()}.csv`, toCSV(transactions, (id) => getCategory(id).label));
  };

  const clearSample = async () => {
    const removed = transactions.filter((t) => t.demo);
    setTransactions((list) => list.filter((t) => !t.demo));
    try {
      await cloud.deleteSamples();
    } catch (err) {
      setTransactions((list) => [...removed, ...list]);
      failed(err, 'Could not clear sample data. Try again.');
      return;
    }
    notify('Sample data cleared', { label: 'Undo', onClick: () => restore(removed) });
  };

  const loadSample = async () => {
    try {
      await cloud.deleteSamples();
      const added = await cloud.insertTransactions(user.id, buildSeed());
      setTransactions((list) => [...added, ...list.filter((t) => !t.demo)]);
      setMonth(nowKey);
      notify('Sample data loaded');
    } catch (err) {
      failed(err, 'Could not load sample data. Try again.');
    }
  };

  const clearAll = async () => {
    const previous = transactions;
    setTransactions([]);
    try {
      await cloud.deleteAll(user.id);
    } catch (err) {
      setTransactions(previous);
      failed(err, 'Could not clear your data. Try again.');
      return;
    }
    notify('All data cleared', { label: 'Undo', onClick: () => restore(previous) });
  };

  const changeBudget = async (value) => {
    const previous = budget;
    setBudget(value);
    try {
      await cloud.saveSettings(user.id, { budget: value });
    } catch (err) {
      setBudget(previous);
      failed(err, 'Could not save your budget. Try again.');
    }
  };

  const changeCurrency = async (code) => {
    const previous = currencyCode;
    setCurrencyCode(code);
    try {
      await cloud.saveSettings(user.id, { currency: code });
    } catch (err) {
      setCurrencyCode(previous);
      failed(err, 'Could not save your currency. Try again.');
    }
  };

  const pickCategory = (id) =>
    setFilters((f) => ({
      ...f,
      scope: 'month',
      type: 'all',
      category: f.category === id ? 'all' : id,
    }));

  const defaultDate = month === nowKey ? todayISO() : `${month}-01`;

  if (status !== 'ready') {
    return (
      <div className="boot" role="status">
        {status === 'loading' ? (
          <p>Loading your entries…</p>
        ) : (
          <>
            <p>We could not load your data. Check your connection and try again.</p>
            <div className="boot-actions">
              <button className="btn btn-primary" onClick={load}>
                Try again
              </button>
              <button className="btn btn-outline" onClick={onSignOut}>
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="app">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        currency={currencyCode}
        onCurrency={changeCurrency}
        onAdd={openAdd}
        onExport={exportCsv}
        onLoadSample={loadSample}
        onClearAll={clearAll}
        email={user.email}
        onSignOut={onSignOut}
        canExport={transactions.length > 0}
      />

      <main>
        {hasSample && (
          <div className="notice">
            <p>You are looking at sample data.</p>
            <button className="notice-action" onClick={clearSample}>
              Clear sample data
            </button>
          </div>
        )}

        <div className="monthbar">
          <div className="month-nav">
            <button className="icon-btn" onClick={() => setMonth((m) => shiftMonth(m, -1))} aria-label="Previous month">
              <ChevronLeft size={22} />
            </button>
            <h1 aria-live="polite">{monthYear(month)}</h1>
            <button className="icon-btn" onClick={() => setMonth((m) => shiftMonth(m, 1))} aria-label="Next month">
              <ChevronRight size={22} />
            </button>
          </div>
          {month !== nowKey && (
            <button className="link-btn" onClick={() => setMonth(nowKey)}>
              Back to {monthLong(nowKey)}
            </button>
          )}
        </div>

        <Hero
          monthKey={month}
          spent={now.expense}
          budget={budget}
          onBudget={changeBudget}
          series={series}
          money={money}
          compact={compact}
        />

        <Stats monthKey={month} now={now} before={before} money={money} />

        <div className="columns">
          <aside className="aside">
            <Breakdown
              items={categories}
              total={now.expense}
              money={money}
              activeId={filters.category}
              onPick={pickCategory}
              monthName={monthLong(month)}
            />
            <History
              months={months}
              activeKey={month}
              budget={budget}
              onPick={setMonth}
              money={money}
              compact={compact}
            />
          </aside>

          <Ledger
            items={listItems}
            filters={filters}
            onFilters={setFilters}
            monthName={monthLong(month)}
            monthCount={monthTx.length}
            money={money}
            onEdit={(tx) => setModal({ tx })}
            onDelete={deleteTransaction}
            onAdd={openAdd}
          />
        </div>
      </main>

      <footer className="footer">
        <p>Your entries are saved to your account.</p>
      </footer>

      <button className="fab" onClick={openAdd} aria-label="Add transaction">
        <Plus size={26} />
      </button>

      {modal && (
        <TransactionModal
          key={modal.tx?.id ?? 'new'}
          initial={modal.tx}
          defaultDate={defaultDate}
          currencySymbol={currency.symbol}
          onSave={saveTransaction}
          onClose={closeModal}
        />
      )}

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
