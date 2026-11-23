import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AuthScreen() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  const signingUp = mode === 'signup';

  const switchMode = () => {
    setMode(signingUp ? 'signin' : 'signup');
    setError('');
    setInfo('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (signingUp && password.length < 6) {
      setError('Use a password with at least 6 characters.');
      return;
    }

    setBusy(true);
    try {
      if (signingUp) {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (err) throw err;
        // With "Confirm email" switched on in Supabase there is no session yet.
        if (!data.session) setInfo('Check your email for a confirmation link, then sign in.');
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) throw err;
      }
      // On success, App picks up the new session by itself.
    } catch (err) {
      setError(err.message || 'Something went wrong. Try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <form className="dialog auth-card" onSubmit={submit} noValidate>
        <div>
          <h1 className="auth-title">{signingUp ? 'Create your account' : 'Welcome back'}</h1>
          <p className="auth-sub">
            {signingUp
              ? 'Your entries are saved to your account and follow you across devices.'
              : 'Sign in to see your entries.'}
          </p>
        </div>

        <label className="field">
          <span className="field-label">Email</span>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="field">
          <span className="field-label">Password</span>
          <input
            type="password"
            autoComplete={signingUp ? 'new-password' : 'current-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {info && (
          <p className="info" role="status">
            {info}
          </p>
        )}

        <button type="submit" className="btn btn-primary" disabled={busy || !email || !password}>
          {busy ? 'One moment…' : signingUp ? 'Create account' : 'Sign in'}
        </button>

        <p className="auth-switch">
          {signingUp ? 'Already have an account? ' : 'New to Spendly? '}
          <button type="button" className="link-btn" onClick={switchMode}>
            {signingUp ? 'Sign in' : 'Create an account'}
          </button>
        </p>
      </form>
    </div>
  );
}
