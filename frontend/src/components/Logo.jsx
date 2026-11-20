import React, { useId } from 'react';

const markSizes = {
  sm: 'h-9 w-9 rounded-[var(--radius-xs)]',
  md: 'h-11 w-11 rounded-[var(--radius-sm)]',
  lg: 'h-16 w-16 rounded-[var(--radius-md)]',
};

export default function Logo({
  size = 'md',
  markOnly = false,
  showTagline = true,
  className = '',
}) {
  const rawId = useId();
  const id = rawId.replace(/[^a-zA-Z0-9_-]/g, '');
  const markClass = markSizes[size] || markSizes.md;

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className={`logo-mark ${markClass}`} aria-hidden="true">
        <svg viewBox="0 0 64 64" className="h-full w-full" role="img" aria-label="Naija Scholar">
          <defs>
            <linearGradient id={`${id}-bg`} x1="8" y1="6" x2="56" y2="58" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="0.52" stopColor="#6366F1" />
              <stop offset="1" stopColor="#3B82F6" />
            </linearGradient>
            <linearGradient id={`${id}-book`} x1="16" y1="38" x2="48" y2="54" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FFFFFF" stopOpacity="0.98" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.7" />
            </linearGradient>
            <filter id={`${id}-shadow`} x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#312E81" floodOpacity="0.28" />
            </filter>
          </defs>

          <rect
            x="4"
            y="4"
            width="56"
            height="56"
            rx="18"
            fill={`url(#${id}-bg)`}
            stroke="rgba(255,255,255,0.78)"
            strokeWidth="2"
            filter={`url(#${id}-shadow)`}
          />

          <path d="M14 22.5 32 14l18 8.5-18 8.5-18-8.5Z" fill="#FFFFFF" opacity="0.96" />
          <path
            d="M22 27.5v8.5c0 3.3 4.5 6 10 6s10-2.7 10-6v-8.5"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.9"
          />
          <path d="M50 24v9" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />
          <circle cx="50" cy="36" r="1.8" fill="#FFFFFF" opacity="0.9" />

          <path
            d="M13 40c5.8-2.6 11.8-2.4 17.5 1.3v11.2c-5.7-3.7-11.7-3.9-17.5-1.3V40Z"
            fill={`url(#${id}-book)`}
          />
          <path
            d="M51 40c-5.8-2.6-11.8-2.4-17.5 1.3v11.2c5.7-3.7 11.7-3.9 17.5-1.3V40Z"
            fill={`url(#${id}-book)`}
            opacity="0.88"
          />
          <path d="M32 41.3v11.2" stroke="#4F46E5" strokeWidth="1.8" opacity="0.75" />
          <path
            d="M18 44.5c3.2-.9 6.4-.6 9.4.9M46 44.5c-3.2-.9-6.4-.6-9.4.9"
            stroke="#6366F1"
            strokeWidth="1.4"
            strokeLinecap="round"
            opacity="0.55"
          />

          <path d="M24 16.5l1.2 2.3 2.3 1.2-2.3 1.2L24 23.5l-1.2-2.3-2.3-1.2 2.3-1.2 1.2-2.3Z" fill="#FFFFFF" opacity="0.85" />
        </svg>
      </span>

      {!markOnly && (
        <span className="min-w-0 text-left">
          <span className={`block font-black leading-tight tracking-tight text-slate-900 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
            Naija Scholar
          </span>
          {showTagline && (
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-indigo-600">
              JAMB • WAEC • University
            </span>
          )}
        </span>
      )}
    </span>
  );
}
