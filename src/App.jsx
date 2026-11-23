import { useEffect, useState } from 'react';

import AuthScreen from './components/AuthScreen';
import Tracker from './Tracker';
import { supabase, supabaseConfigured } from './lib/supabase';

const preferredTheme = () =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

// Gatekeeper: decides between the setup notice, the sign-in screen and the tracker.
export default function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  // Apply the saved theme early so the sign-in screen matches it too.
  useEffect(() => {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem('spendly:theme'));
    } catch {
      /* ignore */
    }
    document.documentElement.setAttribute(
      'data-theme',
      saved === 'dark' || saved === 'light' ? saved : preferredTheme(),
    );
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) return undefined;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured) {
    return (
      <div className="boot">
        <p>
          Supabase is not set up yet. Add <code>VITE_SUPABASE_URL</code> and{' '}
          <code>VITE_SUPABASE_ANON_KEY</code> to your environment variables, then rebuild.
        </p>
      </div>
    );
  }

  if (session === undefined) {
    return (
      <div className="boot" role="status">
        <p>Loading…</p>
      </div>
    );
  }

  if (!session) return <AuthScreen />;

  return (
    <Tracker
      key={session.user.id}
      user={session.user}
      onSignOut={() => supabase.auth.signOut()}
    />
  );
}
