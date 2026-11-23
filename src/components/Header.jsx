import { useEffect, useRef, useState } from 'react';
import { Download, Ellipsis, LogOut, Moon, Plus, Sparkles, Sun, Trash2 } from 'lucide-react';
import { CURRENCIES } from '../lib/constants';

function Mark() {
  return (
    <svg className="brand-mark" viewBox="0 0 64 64" aria-hidden="true">
      <rect width="64" height="64" rx="18" fill="#CBBEF3" />
      <path
        d="M44 22C40 16 20 16 20 26C20 36 44 30 44 40C44 50 24 50 20 43"
        fill="none"
        stroke="#141A2E"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="48" cy="16" r="5" fill="#F2B01E" />
    </svg>
  );
}

export default function Header({
  theme,
  onToggleTheme,
  currency,
  onCurrency,
  onAdd,
  onExport,
  onLoadSample,
  onClearAll,
  email,
  onSignOut,
  canExport,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const run = (fn) => () => {
    setOpen(false);
    fn();
  };

  return (
    <header className="header">
      <a className="brand" href="/" aria-label="Spendly home">
        <Mark />
        <span>Spendly</span>
      </a>

      <div className="header-actions">
        <button className="btn btn-primary header-add" onClick={onAdd}>
          <Plus size={18} aria-hidden="true" />
          Add transaction
        </button>

        <button
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          title={theme === 'dark' ? 'Light theme' : 'Dark theme'}
        >
          {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="menu" ref={menuRef}>
          <button
            className="icon-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label="More options"
            aria-haspopup="menu"
            aria-expanded={open}
          >
            <Ellipsis size={20} />
          </button>

          {open && (
            <div className="menu-panel" role="menu">
              {email && <p className="menu-email">{email}</p>}
              <label className="menu-field">
                <span>Currency</span>
                <select value={currency} onChange={(e) => onCurrency(e.target.value)}>
                  {CURRENCIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <button className="menu-item" role="menuitem" onClick={run(onExport)} disabled={!canExport}>
                <Download size={17} aria-hidden="true" />
                Export as CSV
              </button>
              <button className="menu-item" role="menuitem" onClick={run(onLoadSample)}>
                <Sparkles size={17} aria-hidden="true" />
                Load sample data
              </button>
              <button className="menu-item menu-danger" role="menuitem" onClick={run(onClearAll)}>
                <Trash2 size={17} aria-hidden="true" />
                Clear all data
              </button>
              <button className="menu-item" role="menuitem" onClick={run(onSignOut)}>
                <LogOut size={17} aria-hidden="true" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
