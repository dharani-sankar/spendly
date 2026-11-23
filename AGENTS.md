# Spendly: agent instructions

Personal expense tracker. Vite + React 19, plain CSS, Recharts, lucide-react. Backend: Supabase (Postgres + Auth). Transactions, budget and currency are stored per user; only the theme stays in `localStorage`.

## Commands
- `npm install`: install dependencies
- `npm run dev`: dev server at http://localhost:5173
- `npm run build`: production build into `dist/` (this is what Vercel runs)
- `npm run preview`: serve the production build locally

## Structure
- `src/App.jsx`: auth gate (setup notice, sign-in screen, or the tracker)
- `src/Tracker.jsx`: state, derived data, all actions (add, edit, delete with undo, export, clear)
- `src/lib/supabase.js` (client) and `src/lib/cloud.js` (every database call)
- `supabase/schema.sql`: tables and Row Level Security policies, run once in the Supabase SQL Editor
- `src/lib/`: pure helpers. `format.js` (dates, money, CSV), `stats.js` (totals, category breakdown, pace series), `constants.js` (categories, currencies), `seed.js` (sample data), `useLocalStorage.js`
- `src/components/`: Header, Hero (headline + pace chart + budget), Stats, Breakdown, History, Ledger, TransactionModal, Toast
- `src/index.css`: every style. Design tokens are at the top as CSS variables.

## Conventions
- Dates are plain `YYYY-MM-DD` strings. Never use `new Date("YYYY-MM-DD")`; use `parseISO` from `format.js` so time zones cannot shift an entry.
- Money is formatted only through `makeFormatters(currency)`. Pass positive numbers and add the sign in the UI.
- Env variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (never the service_role key). Theme key is `spendly:theme`. Sample entries carry `demo: true`.
- UI copy is sentence case, active voice, and names an action the same way everywhere ("Add expense" leads to "Expense added").
- Keep the design: one bold element (the lavender hero), calm light ground, serif for numerals and headings, no card boxes around sections.

## Before finishing a change
Run `npm run build` and confirm it passes. Check both themes and a 390px wide viewport.
