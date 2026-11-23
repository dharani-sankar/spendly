# Spendly

A personal expense tracker that answers one question first: **how much can I still spend this month?**

- Plain-language headline and a pace chart (spent so far vs. an even budget line)
- Income, spending and savings for the month, compared with last month
- "Where it went" category ribbon. Click a category to filter the ledger.
- Six-month history with your budget line. Click a bar to jump to that month.
- Ledger grouped by day with search, type and category filters, edit, delete and undo
- Monthly budget, currency switcher (INR default), light and dark themes
- CSV export. Data is saved in the browser (`localStorage`), nothing is uploaded.

Built with Vite, React 19, Recharts, lucide-react and plain CSS. No backend, no environment variables.

## Run it locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in dist/
npm run preview    # serve the production build
```

Requires Node 18 or newer.

## Work on it in Google Antigravity

1. Install and open Antigravity, then open this folder as your workspace (Agent Manager: **Open Folder**, or **New Project → Add Folder** in Antigravity 2.0).
2. Antigravity reads `AGENTS.md` and `.agents/rules/` in the workspace, so the agent already knows the structure, commands and design rules.
3. Open the integrated terminal and run `npm install && npm run dev`.
4. Ask the agent for changes. Good first prompts:
   - "Add a recurring transactions feature: a toggle in the add dialog that repeats monthly, and a Recurring filter in the ledger."
   - "Add per-category budgets and show a warning on a category row when it passes 90%."
   - "Add an Import CSV option in the More menu that reads the same format Export CSV produces."
5. Ask it to run `npm run build` before you commit.

## Deploy to Vercel

Vercel detects Vite automatically. `vercel.json` already sets the build command and output folder.

**Option A: GitHub (recommended, redeploys on every push)**

```bash
git init
git add .
git commit -m "Spendly expense tracker"
git branch -M main
git remote add origin https://github.com/<your-username>/spendly.git
git push -u origin main
```

Then go to [vercel.com/new](https://vercel.com/new), import the repository and click **Deploy**. Keep the defaults: Framework Preset *Vite*, Build Command `npm run build`, Output Directory `dist`.

**Option B: Vercel CLI**

```bash
npm i -g vercel
vercel          # first deploy (preview)
vercel --prod   # production deploy
```

## Project structure

```
src/
  App.jsx                 state, derived data, actions
  index.css               design tokens + all styles
  lib/
    constants.js          categories, colours, currencies
    format.js             dates, money, CSV export
    stats.js              totals, category breakdown, pace series
    seed.js               sample data for first visit
    useLocalStorage.js    persisted state hook
  components/
    Header.jsx  Hero.jsx  Stats.jsx  Breakdown.jsx
    History.jsx  Ledger.jsx  TransactionModal.jsx  Toast.jsx
```

## Make it yours

- Categories and colours: `src/lib/constants.js`
- Default budget and sample data: `src/lib/seed.js`
- Colours, fonts and spacing: variables at the top of `src/index.css`
- Default currency: the `'INR'` default in `src/App.jsx`

## Notes

- Data lives in one browser on one device. To move it, use **Export as CSV**.
- Clearing browser site data deletes your entries.
