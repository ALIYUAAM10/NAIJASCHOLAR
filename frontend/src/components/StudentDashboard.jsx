import React from 'react';

const quickActions = [
  {
    key: 'jamb',
    icon: '🎯',
    title: 'Continue JAMB',
    description: 'Topic questions and full mocks',
    tone: 'from-indigo-400/25 to-indigo-300/15',
  },
  {
    key: 'university',
    icon: '🎓',
    title: 'University units',
    description: 'Practise by faculty and level',
    tone: 'from-sky-400/25 to-cyan-300/15',
  },
  {
    key: 'past-questions',
    icon: '📝',
    title: 'Past questions',
    description: 'Find and review real exam sets',
    tone: 'from-amber-300/25 to-red-300/15',
  },
  {
    key: 'practice',
    icon: '⏱️',
    title: 'Timed practice',
    description: 'Server-graded CBT sessions',
    tone: 'from-emerald-300/25 to-teal-300/15',
  },
  {
    key: 'planner',
    icon: '📅',
    title: 'Study planner',
    description: 'Plan a pace that fits you',
    tone: 'from-indigo-400/25 to-indigo-300/15',
  },
  {
    key: 'library',
    icon: '📚',
    title: 'Study library',
    description: 'Books, notes and resources',
    tone: 'from-blue-300/25 to-indigo-300/15',
  },
];

const featureHighlights = [
  { icon: '🧮', label: 'Server graded' },
  { icon: '🔐', label: 'Secure auth' },
  { icon: '📈', label: 'Saved progress' },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function StudentDashboard({ profile, dashboard, exams, onNavigate, onStartExam }) {
  const stats = dashboard?.stats || {};
  const attempts = dashboard?.recentAttempts || [];
  const progress = dashboard?.progress || {};

  const completed = stats.completedExams || 0;
  const average = Number(stats.averagePercentage || 0).toFixed(1);
  const accuracy = stats.totalQuestions
    ? Math.round((stats.correctAnswers || 0) / stats.totalQuestions * 100)
    : 0;

  const firstName = (profile?.username || profile?.displayName || 'student')
    .split(/[\s_.-]+/)[0]
    .replace(/^./, (char) => char.toUpperCase());

  const progressEntries = Object.entries(progress)
    .map(([key, value]) => ({
      key,
      name: key.replace(/[-_]/g, ' '),
      ...value,
    }))
    .filter((entry) => entry.attempts > 0)
    .sort((a, b) => b.averagePercentage - a.averagePercentage)
    .slice(0, 4);

  const recommended = (exams || [])
    .slice()
    .sort((a, b) => (b.questionCount || b.totalQuestions || 0) - (a.questionCount || a.totalQuestions || 0))
    .slice(0, 2);

  const cards = [
    { icon: '✅', label: 'Sessions completed', value: completed, hint: 'all-time mocks' },
    { icon: '🎯', label: 'Average score', value: `${average}%`, hint: 'across attempts' },
    { icon: '🧠', label: 'Answer accuracy', value: `${accuracy}%`, hint: `${stats.correctAnswers || 0} correct answers` },
    { icon: '📅', label: 'Last practice', value: stats.lastAttemptAt ? formatDate(stats.lastAttemptAt) : 'Not yet', hint: 'keep your streak going' },
  ];

  return (
    <div className="space-y-7 pb-16">
      <section className="glass-hero relative overflow-hidden rounded-[32px] px-6 py-8 sm:px-10 sm:py-10">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-indigo-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-300/35 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <span className="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Student dashboard
            </span>
            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
              {greeting()}, {firstName} 👋
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              Your study space is ready. Pick up where you left off, review your progress,
              or start a fresh timed mock.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {featureHighlights.map((item) => (
                <span key={item.label} className="glass-chip rounded-full px-3 py-1.5 text-[11px] font-bold text-slate-600">
                  {item.icon} {item.label}
                </span>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-3">
            <button
              onClick={() => onNavigate('practice')}
              className="glass-button-primary rounded-2xl px-5 py-3 text-sm font-bold text-[#fff]"
            >
              Start a mock →
            </button>
            <button
              onClick={() => onNavigate('explore')}
              className="glass-button rounded-2xl px-5 py-3 text-sm font-bold text-indigo-700"
            >
              Explore all tools
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="glass-card glass-card-hover rounded-3xl p-5">
            <div className="flex items-start justify-between">
              <span className="text-xl">{card.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{card.hint}</span>
            </div>
            <div className="mt-4 text-2xl font-black tracking-tight text-slate-900">{card.value}</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">{card.label}</div>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Quick actions</h2>
              <p className="mt-1 text-xs text-slate-500">Jump straight into what you need.</p>
            </div>
            <button onClick={() => onNavigate('explore')} className="text-xs font-bold text-indigo-600 hover:underline">
              View all
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {quickActions.map((action) => (
              <button
                key={action.key}
                onClick={() => onNavigate(action.key)}
                className={`glass-card-hover flex items-start gap-3 rounded-2xl bg-gradient-to-br p-4 text-left ${action.tone}`}
              >
                <span className="text-xl">{action.icon}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-slate-900">{action.title}</span>
                  <span className="mt-0.5 block text-[11px] text-slate-600">{action.description}</span>
                </span>
                <span className="ml-auto text-slate-400">↗</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-extrabold text-slate-900">Subject progress</h2>
          <p className="mt-1 text-xs text-slate-500">Your strongest topics from recent sessions.</p>

          {progressEntries.length > 0 ? (
            <div className="mt-5 space-y-4">
              {progressEntries.map((entry) => {
                const percent = Math.max(0, Math.min(100, Number(entry.averagePercentage || 0)));
                return (
                  <div key={entry.key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold capitalize text-slate-700">{entry.name}</span>
                      <span className="font-bold text-indigo-600">{percent.toFixed(1)}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/70">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-indigo-300/70 bg-white/40 p-5 text-center">
              <div className="text-2xl">📊</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                Your first completed mock will unlock subject-level progress here.
              </p>
              <button
                onClick={() => onNavigate('practice')}
                className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
              >
                Take your first mock
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <div className="glass-card rounded-3xl p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Recent attempts</h2>
              <p className="mt-1 text-xs text-slate-500">A quick look at your latest work.</p>
            </div>
            <button onClick={() => onNavigate('practice')} className="text-xs font-bold text-indigo-600 hover:underline">
              See all
            </button>
          </div>

          {attempts.length > 0 ? (
            <div className="mt-5 space-y-3">
              {attempts.slice(0, 4).map((attempt) => {
                const scorePct = Number.isFinite(attempt.percentage)
                  ? Math.round(attempt.percentage)
                  : Math.round((attempt.score || 0) / (attempt.totalQuestions || 1) * 100);
                return (
                  <div
                    key={attempt.id}
                    className="glass-chip flex flex-col gap-3 rounded-2xl px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">{attempt.subject}</span>
                        <span className="text-[10px] text-slate-400">•</span>
                        <span className="text-[10px] text-slate-500">{formatDate(attempt.completedAt)}</span>
                      </div>
                      <div className="mt-1 truncate text-sm font-bold text-slate-900">{attempt.title}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="score-value text-sm font-black text-slate-900 tabular-nums">{attempt.score}/{attempt.totalQuestions}</div>
                      <div className={`score-value text-[11px] font-bold tabular-nums ${scorePct >= 50 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {scorePct}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-dashed border-indigo-300/70 bg-white/40 p-6 text-center">
              <div className="text-2xl">✨</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                No attempts yet. Your completed mocks will appear here with scores and dates.
              </p>
              <button
                onClick={() => onNavigate('practice')}
                className="glass-button-primary mt-4 rounded-xl px-4 py-2 text-xs font-bold text-[#fff]"
              >
                Start practising
              </button>
            </div>
          )}
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-extrabold text-slate-900">Recommended for you</h2>
          <p className="mt-1 text-xs text-slate-500">Popular practice sets to keep you moving.</p>

          <div className="mt-5 space-y-3">
            {recommended.length > 0 ? (
              recommended.map((exam) => (
                <div key={exam.id} className="glass-chip rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                        {exam.examType || exam.subject}
                      </span>
                      <h3 className="mt-1 truncate text-sm font-bold text-slate-900">{exam.title}</h3>
                      <p className="mt-1 text-[11px] text-slate-500">
                        {exam.durationMinutes || 30} min · {exam.questionCount || exam.totalQuestions || '?' } questions
                      </p>
                    </div>
                    <button
                      onClick={() => onStartExam(exam)}
                      className="glass-button-primary shrink-0 rounded-xl px-3 py-2 text-[11px] font-bold text-[#fff]"
                    >
                      Start
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-indigo-300/70 bg-white/40 p-5 text-center text-xs text-slate-600">
                Practice sets are loading.
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('explore')}
            className="glass-button mt-5 w-full rounded-xl py-2.5 text-xs font-bold text-indigo-700"
          >
            Browse everything
          </button>
        </div>
      </section>
    </div>
  );
}
