# Spendly: agent instructions

Personal expense tracker. Vite + React 19, plain CSS, Recharts, lucide-react. No backend: data lives in `localStorage`.

## Commands
- `npm install`: install dependencies
- `npm run dev`: dev server at http://localhost:5173
- `npm run build`: production build into `dist/` (this is what Vercel runs)
- `npm run preview`: serve the production build locally

## Structure
- `src/App.jsx`: state, derived data, all actions (add, edit, delete with undo, export, clear)
- `src/lib/`: pure helpers. `format.js` (dates, money, CSV), `stats.js` (totals, category breakdown, pace series), `constants.js` (categories, currencies), `seed.js` (sample data), `useLocalStorage.js`
- `src/components/`: Header, Hero (headline + pace chart + budget), Stats, Breakdown, History, Ledger, TransactionModal, Toast
- `src/index.css`: every style. Design tokens are at the top as CSS variables.

## Conventions
- Dates are plain `YYYY-MM-DD` strings. Never use `new Date("YYYY-MM-DD")`; use `parseISO` from `format.js` so time zones cannot shift an entry.
- Money is formatted only through `makeFormatters(currency)`. Pass positive numbers and add the sign in the UI.
- Storage keys are prefixed `spendly:`. Sample entries carry `demo: true`.
- UI copy is sentence case, active voice, and names an action the same way everywhere ("Add expense" leads to "Expense added").
- Keep the design: one bold element (the lavender hero), calm light ground, serif for numerals and headings, no card boxes around sections.

## Before finishing a change
Run `npm run build` and confirm it passes. Check both themes and a 390px wide viewport.
