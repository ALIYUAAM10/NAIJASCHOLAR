import React from 'react';
import Logo from './Logo';

const links = [
  { key: 'home', label: 'Dashboard', icon: 'dashboard' },
  { key: 'explore', label: 'Explore', icon: 'explore' },
  { key: 'jamb', label: 'JAMB', icon: 'jamb' },
  { key: 'university', label: 'University', icon: 'university' },
  { key: 'past-questions', label: 'Past Questions', icon: 'questions' },
  { key: 'library', label: 'Library', icon: 'library' },
  { key: 'practice', label: 'Practice Exams', icon: 'practice' },
  { key: 'planner', label: 'Planner', icon: 'planner' },
];

function NavIcon({ name }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'h-4 w-4',
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="2" />
          <rect x="14" y="3" width="7" height="7" rx="2" />
          <rect x="3" y="14" width="7" height="7" rx="2" />
          <rect x="14" y="14" width="7" height="7" rx="2" />
        </svg>
      );
    case 'explore':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="m15.5 8.5-2.2 4.8-4.8 2.2 2.2-4.8 4.8-2.2Z" />
        </svg>
      );
    case 'jamb':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.5" />
        </svg>
      );
    case 'university':
      return (
        <svg {...common}>
          <path d="m3 9 9-4 9 4-9 4-9-4Z" />
          <path d="M7 11v5c0 1.7 2.2 3 5 3s5-1.3 5-3v-5" />
          <path d="M21 9v6" />
        </svg>
      );
    case 'questions':
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4.5V3h6v1.5M9 10h6M9 14h6M9 18h3" />
        </svg>
      );
    case 'library':
      return (
        <svg {...common}>
          <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H12v16H6.5A2.5 2.5 0 0 0 4 21.5v-16Z" />
          <path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H12v16h5.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" />
        </svg>
      );
    case 'practice':
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="8" />
          <path d="M12 9v4l2.5 2M9 2h6" />
        </svg>
      );
    case 'planner':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18M8 14h3M8 17h6" />
        </svg>
      );
    default:
      return null;
  }
}

export default function Navbar({ user, onLogout, onNavigate, view }) {
  const initials = (user?.username || user?.email || 'S').charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-50 -mx-4 px-4 pt-3 sm:-mx-6 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-2">
        <div className="glass-card flex items-center justify-between gap-4 rounded-2xl px-4 py-3">
          <button onClick={() => onNavigate('home')} className="rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-400">
            <Logo size="md" />
          </button>

          {user && (
            <div className="flex items-center gap-3">
              <span className="hidden text-right sm:block">
                <span className="block text-xs font-bold text-slate-800">{user.username}</span>
                <span className="block text-[10px] text-slate-500">{user.email}</span>
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-500 via-fuchsia-500 to-pink-400 text-xs font-black text-[#fff] shadow-lg shadow-violet-500/25">
                {initials}
              </span>
              <button
                onClick={onLogout}
                className="glass-button rounded-xl px-3.5 py-1.5 text-xs font-bold text-rose-600 transition hover:text-rose-700"
              >
                Sign out
              </button>
            </div>
          )}
        </div>

        <nav className="glass-toolbar flex items-center gap-1 overflow-x-auto rounded-2xl p-1.5" aria-label="Dashboard tools">
          <span className="toolbar-kicker hidden shrink-0 items-center gap-2 px-2 text-[10px] font-black uppercase tracking-[0.16em] text-violet-600 lg:flex">
            <span className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
            Tools
          </span>
          <span className="mx-1 hidden h-6 w-px shrink-0 bg-white/70 lg:block" />

          {links.map((link) => (
            <button
              key={link.key}
              type="button"
              aria-label={link.label}
              aria-current={view === link.key ? 'page' : undefined}
              onClick={() => onNavigate(link.key)}
              className={`toolbar-item shrink-0 ${view === link.key ? 'is-active' : ''}`}
            >
              <span className="toolbar-icon">
                <NavIcon name={link.icon} />
              </span>
              <span className="toolbar-label hidden sm:inline">{link.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
