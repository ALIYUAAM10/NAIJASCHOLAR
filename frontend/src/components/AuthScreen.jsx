import React, { useState } from 'react';
import { api } from '../services/api';
import {
  friendlyAuthError,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
} from '../services/firebase';

export default function AuthScreen({ configError = '', embedded = false }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        await registerWithEmail({
          email: form.email.trim(),
          password: form.password,
          username: form.username.trim(),
        });

        try {
          await api.updateProfile({ username: form.username.trim() });
        } catch (profileError) {
          // The Firebase account exists; the server will lazily create the
          // profile from the display name if this sync fails.
          console.warn('Profile sync failed after registration:', profileError);
        }
      } else {
        await loginWithEmail(form.email.trim(), form.password);
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError('');
    setLoading(true);

    try {
      await loginWithGoogle();
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  const disabled = loading || Boolean(configError);

  return (
    <div className={embedded ? 'w-full' : 'min-h-[85vh] flex items-center justify-center px-4 py-8'}>
      <div className="glass-card w-full max-w-md rounded-3xl p-6 md:p-8 shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-pink-400 font-black text-[#fff] text-2xl shadow-xl shadow-violet-500/25 mb-4">
            NP
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            {embedded ? 'Sign in to continue' : 'Welcome to NaijaPrep'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            Access JAMB, WAEC & Post-UTME timed practice quizzes anytime, anywhere.
          </p>
        </div>

        {configError && (
          <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs font-medium text-amber-200">
            {configError}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogle}
          disabled={disabled}
          className="glass-button mb-5 flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
            <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-2 3.02v2.52h3.24c1.9-1.75 2.98-4.33 2.98-7.38Z" />
            <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.39l-3.24-2.52c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.13H3.06v2.6A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.41 13.92A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.92v-2.6H3.06A10 10 0 0 0 2 12c0 1.61.38 3.13 1.06 4.48l3.35-2.56Z" />
            <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.94 5.48l3.35 2.6C7.2 7.8 9.4 6.04 12 6.04Z" />
          </svg>
          Continue with Google
        </button>

        <div className="mb-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          <span className="h-px flex-1 bg-slate-800" />
          or use email
          <span className="h-px flex-1 bg-slate-800" />
        </div>

        <div className="glass-chip mb-6 flex rounded-2xl p-1">
          <button
            type="button"
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-[#fff] shadow-md shadow-violet-500/25 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Log In
          </button>
          <button
            type="button"
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all duration-200 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-[#fff] shadow-md shadow-violet-500/25 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs font-medium text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Full Name / Username
              </label>
              <input
                required
                minLength={3}
                maxLength={30}
                autoComplete="nickname"
                className="glass-input w-full rounded-xl px-4 py-3 text-sm transition"
                placeholder="e.g. Adebayo123"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <input
              required
              type="email"
              autoComplete="email"
              className="glass-input w-full rounded-xl px-4 py-3 text-sm transition"
              placeholder="student@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <input
                required
                minLength={6}
                type={showPassword ? 'text' : 'password'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className="glass-input w-full rounded-xl px-4 py-3 pr-12 text-sm transition"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-emerald-400 transition-colors duration-150"
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    <path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={disabled}
            className="glass-button-primary mt-2 w-full rounded-xl py-3.5 text-sm font-bold text-[#fff] active:scale-[0.99] transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Practice' : 'Register Now'}
          </button>
        </form>
      </div>
    </div>
  );
}
