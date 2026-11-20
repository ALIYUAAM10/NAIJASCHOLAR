import React from 'react';

const links = [
  { key: 'home', label: 'Dashboard' },
  { key: 'explore', label: 'Explore' },
  { key: 'jamb', label: 'JAMB' },
  { key: 'university', label: 'University' },
  { key: 'past-questions', label: 'Past Questions' },
  { key: 'library', label: 'Library' },
  { key: 'practice', label: 'Practice Exams' },
  { key: 'planner', label: 'Planner' },
];

export default function Navbar({ user, onLogout, onNavigate, view }) {
  return (
    <header className="glass-card sticky top-0 z-50 -mx-4 rounded-b-3xl px-4 py-3 sm:-mx-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-pink-400 text-lg font-black text-[#fff] shadow-lg shadow-violet-500/25">
              NS
            </span>
            <span>
              <span className="block text-base font-extrabold leading-tight tracking-tight text-slate-900">Naija Scholar</span>
              <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-violet-600">
                JAMB • WAEC • University
              </span>
            </span>
          </button>

          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden text-right lg:block">
                <div className="text-xs font-bold text-slate-800">{user.username}</div>
                <div className="text-[10px] text-slate-500">{user.email}</div>
              </div>
              <button
                onClick={onLogout}
                className="glass-button rounded-xl px-3.5 py-1.5 text-xs font-bold text-rose-600 transition hover:text-rose-700"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        <nav className="mt-3 flex gap-1.5 overflow-x-auto pb-1" aria-label="Main navigation">
          {links.map((link) => (
            <button
              key={link.key}
              onClick={() => onNavigate(link.key)}
              className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                view === link.key
                  ? 'glass-button-primary text-[#fff]'
                  : 'glass-chip text-slate-600 hover:text-violet-700'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
