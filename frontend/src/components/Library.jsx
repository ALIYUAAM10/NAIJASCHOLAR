import React, { useMemo, useState } from 'react';
import { useJsonData } from '../hooks/useJsonData';

function safeUrl(value) {
  try {
    const url = new URL(String(value || ''));
    return ['https:', 'http:'].includes(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

export default function Library({ data, onNavigate }) {
  const { data: library, loading, error } = useJsonData('/data/library.json');
  const [query, setQuery] = useState('');
  const [type, setType] = useState(data?.type || '');

  const types = useMemo(() => {
    if (!library) return [];
    return [...new Set(library.map((item) => item.type).filter(Boolean))].sort();
  }, [library]);

  const results = useMemo(() => {
    if (!library) return [];
    const q = query.trim().toLowerCase();
    return library.filter((item) => {
      const haystack = [
        item.title,
        item.type,
        item.subject,
        item.course,
        item.level,
        item.source,
        ...(item.audience || []),
      ].filter(Boolean).join(' ').toLowerCase();
      return (!type || item.type === type) && (!q || haystack.includes(q));
    });
  }, [library, query, type]);

  const isPastQuestions = data?.type === 'past-questions';

  return (
    <div className="space-y-6 pb-16">
      <div>
        <button onClick={() => onNavigate('home')} className="mb-3 text-sm font-semibold text-emerald-400 hover:text-emerald-300">← Home</button>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Study library</p>
        <h1 className="mt-2 text-3xl font-black text-white">{isPastQuestions ? 'Past questions' : 'Study library'}</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-400">
          {isPastQuestions
            ? 'Free and open past-question resources for JAMB candidates and university students. Resources open on their original websites.'
            : 'Useful free and open learning links for JAMB candidates and university students. Resources open on their original websites.'}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:flex-row">
        <div className="relative flex-1">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search books, courses, scholarships…"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pl-11 text-sm text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          />
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500">⌕</span>
        </div>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white focus:border-emerald-400 focus:outline-none"
        >
          <option value="">All resources</option>
          {types.map((item) => (
            <option key={item} value={item}>{item.replaceAll('-', ' ')}</option>
          ))}
        </select>
      </div>

      {loading && <div className="py-16 text-center text-slate-400">Loading resources…</div>}
      {error && <div className="py-16 text-center text-rose-400">{error}</div>}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((item) => {
            const url = safeUrl(item.url);
            return (
              <article key={item.id || item.title} className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-5 transition hover:border-emerald-500/30">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="rounded-md bg-emerald-500/10 px-2 py-1 font-bold uppercase text-emerald-400">{(item.type || 'resource').replaceAll('-', ' ')}</span>
                  <span className="text-slate-500">{item.level || 'All levels'}</span>
                </div>
                <h2 className="mt-3 font-bold text-white">{item.title}</h2>
                <p className="mt-1 text-xs text-slate-400">
                  {(item.audience || []).join(' · ') || 'All students'}
                  {item.subject && item.subject !== 'Multiple' ? ` · ${item.subject}` : ''}
                </p>
                <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-xs">
                  <span className="text-slate-500">{item.source || 'Open resource'}</span>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="font-bold text-emerald-400 hover:text-emerald-300">
                      Visit resource ↗
                    </a>
                  ) : (
                    <span className="text-slate-600">Link unavailable</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && !error && !results.length && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 py-16 text-center text-sm text-slate-400">
          No resources match your search.
        </div>
      )}
    </div>
  );
}
