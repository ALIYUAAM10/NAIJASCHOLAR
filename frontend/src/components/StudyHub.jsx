import React from 'react';

const roleCards = [
  {
    key: 'jamb',
    number: '01 / JAMB',
    title: 'JAMB candidate',
    description: 'Preparing for UTME, or just getting started.',
    action: 'Explore practice ↗',
    classes: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 hover:border-emerald-400',
  },
  {
    key: 'university',
    number: '02 / UNIVERSITY',
    title: 'University student',
    description: 'Find your course units and practise by level.',
    action: 'Browse courses ↗',
    classes: 'from-indigo-500/20 to-sky-500/10 border-indigo-500/30 hover:border-indigo-400',
  },
];

const tools = [
  { key: 'planner', number: '01', title: 'Build a study plan', description: 'Set a pace that fits your time and confidence', icon: '📅' },
  { key: 'streak', number: '02', title: 'Study streak', description: 'Mark today’s session and keep the chain alive', icon: '🔥' },
  { key: 'cgpa', number: '03', title: 'CGPA calculator', description: 'Estimate your GPA on the Nigerian 5-point scale', icon: '🧮' },
  { key: 'library', number: '04', title: 'Study library', description: 'Past questions, textbooks, courses and resources', icon: '📚' },
  { key: 'past-questions', number: '05', title: 'Past questions', description: 'Find past-question resources and practice sets', icon: '📝' },
  { key: 'practice', number: '06', title: 'Practice exams', description: 'Timed CBT sessions with server-evaluated scoring', icon: '⏱️' },
  { key: 'contribute', number: '07', title: 'Contribute', description: 'Add original questions or improve the project', icon: '🤝' },
];

export default function StudyHub({ profile, dashboard, onNavigate }) {
  const completed = dashboard?.stats?.completedExams || 0;
  const streakText = profile?.username ? `Welcome back, ${profile.username}` : 'Welcome back';

  return (
    <div className="space-y-8 pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/40 via-teal-900/30 to-slate-900 p-6 md:p-10">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">Learn. Pass. Succeed.</p>
          <h1 className="mt-3 text-3xl font-black leading-tight text-white md:text-5xl">
            Naija Scholar
            <span className="block text-lg font-semibold text-emerald-300 md:text-2xl">Free exam prep for Nigerians.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
            {streakText}. Choose your path, build a plan, and practise with topic questions, university course units, full mocks and a searchable study library.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-slate-300">
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-emerald-300">15 JAMB subjects</span>
            <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5">University courses</span>
            <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1.5">{completed} completed sessions</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">Who are you?</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {roleCards.map((card) => (
            <button
              key={card.key}
              onClick={() => onNavigate(card.key === 'jamb' ? 'jamb' : 'university')}
              className={`group rounded-3xl border bg-gradient-to-br p-6 text-left transition-all duration-200 hover:-translate-y-1 ${card.classes}`}
            >
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{card.number}</span>
              <h3 className="mt-3 text-2xl font-black text-white">{card.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{card.description}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-300 group-hover:text-white">
                {card.action}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-white">Student tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <button
              key={tool.key}
              onClick={() => onNavigate(tool.key)}
              className="flex items-start gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:border-emerald-500/40 hover:bg-slate-900"
            >
              <span className="text-2xl">{tool.icon}</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold text-white">{tool.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-slate-400">{tool.description}</span>
              </span>
              <span className="ml-auto text-slate-600">↗</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
