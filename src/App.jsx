import { useEffect, useMemo, useState } from 'react';
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
  uid,
} from './lib/format';
import { breakdown, history, inMonth, paceSeries, totals } from './lib/stats';
import { buildSeed, DEFAULT_BUDGET } from './lib/seed';
import { useLocalStorage } from './lib/useLocalStorage';

const DEFAULT_FILTERS = { query: '', type: 'all', category: 'all', scope: 'month' };

const preferredTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

export default function App() {
  const [transactions, setTransactions] = useLocalStorage('spendly:transactions', buildSeed);
  const [budget, setBudget] = useLocalStorage('spendly:budget', DEFAULT_BUDGET);
  const [currencyCode, setCurrencyCode] = useLocalStorage('spendly:currency', 'INR');
  const [theme, setTheme] = useLocalStorage('spendly:theme', preferredTheme);

  const nowKey = todayISO().slice(0, 7);
  const [month, setMonth] = useState(nowKey);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [modal, setModal] = useState(null); // { tx } while the dialog is open
  const [toast, setToast] = useState(null);

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

  const saveTransaction = (data) => {
    if (data.id) {
      setTransactions((list) => list.map((t) => (t.id === data.id ? { ...t, ...data, demo: false } : t)));
      notify('Changes saved');
    } else {
      setTransactions((list) => [{ ...data, id: uid(), createdAt: Date.now() }, ...list]);
      notify(data.type === 'income' ? 'Income added' : 'Expense added');
    }
    setMonth(monthOf(data.date)); // jump to the month the entry belongs to
    setModal(null);
  };

  const deleteTransaction = (tx) => {
    setTransactions((list) => list.filter((t) => t.id !== tx.id));
    notify('Entry deleted', { label: 'Undo', onClick: () => setTransactions((list) => [tx, ...list]) });
  };

  const exportCsv = () => {
    downloadText(`spendly-${todayISO()}.csv`, toCSV(transactions, (id) => getCategory(id).label));
  };

  const clearSample = () => {
    const previous = transactions;
    setTransactions((list) => list.filter((t) => !t.demo));
    notify('Sample data cleared', { label: 'Undo', onClick: () => setTransactions(previous) });
  };

  const loadSample = () => {
    setTransactions((list) => [...list.filter((t) => !t.demo), ...buildSeed()]);
    setMonth(nowKey);
    notify('Sample data loaded');
  };

  const clearAll = () => {
    const previous = transactions;
    setTransactions([]);
    notify('All data cleared', { label: 'Undo', onClick: () => setTransactions(previous) });
  };

  const pickCategory = (id) =>
    setFilters((f) => ({
      ...f,
      scope: 'month',
      type: 'all',
      category: f.category === id ? 'all' : id,
    }));

  const defaultDate = month === nowKey ? todayISO() : `${month}-01`;

  return (
    <div className="app">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        currency={currencyCode}
        onCurrency={setCurrencyCode}
        onAdd={openAdd}
        onExport={exportCsv}
        onLoadSample={loadSample}
        onClearAll={clearAll}
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
          onBudget={setBudget}
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
        <p>Your entries are saved in this browser only. Nothing is uploaded.</p>
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
