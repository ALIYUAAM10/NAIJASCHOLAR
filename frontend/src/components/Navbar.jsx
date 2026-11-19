import React from 'react';

const links = [
  { key: 'home', label: 'Home' },
  { key: 'jamb', label: 'JAMB' },
  { key: 'university', label: 'University' },
  { key: 'past-questions', label: 'Past Questions' },
  { key: 'library', label: 'Library' },
  { key: 'practice', label: 'Practice Exams' },
  { key: 'planner', label: 'Planner' },
];

export default function Navbar({ user, onLogout, onNavigate, view }) {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => onNavigate('home')} className="flex items-center gap-3 text-left">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20">N</div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Naija Scholar</h1>
              <p className="text-xs text-emerald-400 font-medium">JAMB • WAEC • University</p>
            </div>
          </button>

          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-sm font-semibold text-slate-200">{user.username}</span>
                <span className="text-xs text-slate-400">{user.email}</span>
              </div>
              <button
                onClick={onLogout}
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 transition-all duration-200"
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
              className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === link.key ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800/70 text-slate-300 hover:bg-slate-700'}`}
            >
              {link.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
