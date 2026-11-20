import React from 'react';
import AuthScreen from './AuthScreen';
import Logo from './Logo';

const features = [
  {
    icon: '🎯',
    tag: 'FRONTEND',
    title: 'JAMB CBT practice',
    description: '15 subjects, grouped topics and timed mock sessions that mirror the real exam flow.',
    tone: 'from-indigo-400/25 to-indigo-300/15',
  },
  {
    icon: '🎓',
    tag: 'FRONTEND',
    title: 'University mode',
    description: 'Browse faculties, courses, levels and GST units, then practise the exact units you offer.',
    tone: 'from-sky-400/25 to-cyan-300/15',
  },
  {
    icon: '📚',
    tag: 'CONTENT',
    title: 'Past questions & library',
    description: 'Searchable past questions, textbooks and course resources in one calm study library.',
    tone: 'from-amber-300/25 to-red-300/15',
  },
  {
    icon: '📅',
    tag: 'TOOLS',
    title: 'Planner, streak & CGPA',
    description: 'Build a study timetable, keep your streak alive and estimate your CGPA on the 5-point scale.',
    tone: 'from-emerald-300/25 to-teal-300/15',
  },
  {
    icon: '🧮',
    tag: 'BACKEND',
    title: 'Server-evaluated scoring',
    description: 'Answers are graded on the server, so every score is consistent, fair and tamper-proof.',
    tone: 'from-indigo-400/25 to-indigo-300/15',
  },
  {
    icon: '🔐',
    tag: 'BACKEND',
    title: 'Secure Firebase accounts',
    description: 'Google and email sign-in with verified ID tokens. Your data stays private to your account.',
    tone: 'from-red-300/25 to-blue-300/15',
  },
  {
    icon: '📈',
    tag: 'INSIGHTS',
    title: 'Progress you can see',
    description: 'Attempts, accuracy and subject progress are saved and visualised after every mock.',
    tone: 'from-cyan-300/25 to-blue-300/15',
  },
  {
    icon: '⚡',
    tag: 'DELIVERY',
    title: 'Fast, global and simple',
    description: 'One lightweight web app with protected APIs, cursor pagination and instant feedback.',
    tone: 'from-indigo-300/25 to-amber-300/15',
  },
];

const steps = [
  {
    number: '01',
    title: 'Create your free account',
    description: 'Sign in with Google or email. No payment, no card, no stress.',
  },
  {
    number: '02',
    title: 'Pick your exam path',
    description: 'Choose JAMB, university units, past questions or a full timed mock.',
  },
  {
    number: '03',
    title: 'Practice and track growth',
    description: 'Get server-checked results and watch your dashboard improve with every attempt.',
  },
];

function scrollTo(id) {
  if (typeof document === 'undefined') return;
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function LandingPage({ configError = '' }) {
  return (
    <div className="space-y-14 pb-20">
      <header className="sticky top-0 z-40 -mx-4 px-4 pt-3 sm:-mx-6 sm:px-6">
        <div className="glass-card mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3 sm:px-5">
          <button onClick={() => scrollTo('top')} className="rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400">
            <Logo size="sm" />
          </button>

          <nav className="hidden items-center gap-6 text-xs font-semibold text-slate-600 md:flex" aria-label="Public navigation">
            <button onClick={() => scrollTo('features')} className="transition hover:text-indigo-700">Features</button>
            <button onClick={() => scrollTo('how-it-works')} className="transition hover:text-indigo-700">How it works</button>
            <button onClick={() => scrollTo('auth')} className="transition hover:text-indigo-700">Get started</button>
          </nav>

          <button
            onClick={() => scrollTo('auth')}
            className="glass-button-primary rounded-xl px-4 py-2 text-xs font-bold text-[#fff] sm:text-sm"
          >
            Sign in free
          </button>
        </div>
      </header>

      <section id="top" className="glass-hero relative overflow-hidden rounded-[32px] px-6 py-10 sm:px-10 md:px-14 md:py-14">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-indigo-300/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-cyan-300/40 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.08fr_.92fr]">
          <div>
            <span className="glass-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Free for Nigerian students
            </span>

            <h1 className="mt-5 text-4xl font-black leading-[1.08] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Ace JAMB, WAEC &
              <span className="block bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-500 bg-clip-text text-transparent">
                university exams.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              One beautiful study space with timed CBT practice, university course units,
              past questions and a dashboard that shows exactly how you are improving.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={() => scrollTo('auth')}
                className="glass-button-primary rounded-2xl px-6 py-3 text-sm font-bold text-[#fff]"
              >
                Start practising →
              </button>
              <button
                onClick={() => scrollTo('features')}
                className="glass-button rounded-2xl px-6 py-3 text-sm font-bold text-indigo-700"
              >
                Explore features
              </button>
            </div>

            <div className="mt-9 grid max-w-lg grid-cols-3 gap-3">
              {[
                { value: '98', label: 'practice exams' },
                { value: '15', label: 'JAMB subjects' },
                { value: '100', label: 'full-mock questions' },
              ].map((item) => (
                <div key={item.label} className="glass-chip rounded-2xl px-3 py-3 text-center">
                  <div className="text-xl font-black text-slate-900 sm:text-2xl">{item.value}</div>
                  <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="glass-card rounded-[28px] p-5 shadow-2xl sm:p-6">
              <div className="flex items-center justify-between">
                <span className="glass-chip rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Full mock · Live preview
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  24:59
                </span>
              </div>

              <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-slate-400">Question 38 of 100</p>
              <h2 className="mt-2 text-base font-bold leading-snug text-slate-900">
                Which of these organs is responsible for pumping blood throughout the body?
              </h2>

              <div className="mt-4 space-y-2">
                {['Liver', 'Heart', 'Kidney', 'Lungs'].map((option, index) => (
                  <div
                    key={option}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-sm ${
                      index === 1
                        ? 'border-indigo-400/60 bg-indigo-500/15 font-bold text-indigo-800'
                        : 'border-white/70 bg-white/50 text-slate-600'
                    }`}
                  >
                    <span>{String.fromCharCode(65 + index)}. {option}</span>
                    {index === 1 && <span className="text-xs">✓</span>}
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/70">
                  <div className="h-full w-[38%] rounded-full bg-gradient-to-r from-indigo-500 to-indigo-500" />
                </div>
                <span className="text-[11px] font-bold text-slate-500">38%</span>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/70 pt-4 text-center">
                <div>
                  <div className="text-sm font-black text-slate-900">Server</div>
                  <div className="text-[9px] font-semibold uppercase text-slate-400">graded</div>
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">Saved</div>
                  <div className="text-[9px] font-semibold uppercase text-slate-400">progress</div>
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">Secure</div>
                  <div className="text-[9px] font-semibold uppercase text-slate-400">account</div>
                </div>
              </div>
            </div>

            <div className="glass-chip absolute -bottom-5 -left-5 hidden rounded-2xl px-4 py-3 shadow-xl sm:block">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Average score</div>
              <div className="text-lg font-black text-emerald-600">78.4%</div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="scroll-mt-24 space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Everything in one place</span>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
            The frontend <span className="text-indigo-600">and</span> the backend, working for you
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 sm:text-base">
            Before you sign in you can see exactly what is waiting. After you sign in, every feature
            becomes a working part of your personal study dashboard.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className={`glass-card glass-card-hover flex h-full flex-col rounded-3xl bg-gradient-to-br p-5 ${feature.tone}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{feature.icon}</span>
                <span className="glass-chip rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                  {feature.tag}
                </span>
              </div>
              <h3 className="mt-4 text-base font-extrabold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Simple by design</span>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">How it works</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="glass-card rounded-3xl p-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-400 text-sm font-black text-[#fff]">
                {step.number}
              </span>
              <h3 className="mt-4 text-base font-extrabold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="auth" className="glass-hero scroll-mt-24 rounded-[32px] px-4 py-10 sm:px-8">
        <div className="mx-auto max-w-xl">
          <div className="mb-6 text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Your dashboard awaits</span>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Come in and start practising</h2>
            <p className="mt-2 text-sm text-slate-600">Create a free account or sign in to open your student dashboard.</p>
          </div>
          <AuthScreen configError={configError} embedded />
        </div>
      </section>

      <footer className="glass-card flex flex-col items-center justify-between gap-3 rounded-3xl px-6 py-5 text-center sm:flex-row sm:text-left">
        <div>
          <Logo size="sm" showTagline={false} />
          <div className="mt-2 text-xs text-slate-500">Free exam prep for Nigerian students.</div>
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Built with React • Firebase • Vercel
        </div>
      </footer>
    </div>
  );
}
