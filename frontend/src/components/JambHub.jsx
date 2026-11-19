import React from 'react';
import { slugify, useJsonData } from '../hooks/useJsonData';

function PageHeading({ title, eyebrow, description, back, onBack }) {
  return (
    <div className="mb-6">
      {back && (
        <button onClick={onBack} className="mb-3 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
          ← {back}
        </button>
      )}
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

export default function JambHub({ data, exams, onNavigate, onStartExam }) {
  const { data: jambData, loading, error } = useJsonData('/data/jamb.json');

  if (loading) return <div className="py-20 text-center text-slate-400">Loading JAMB subjects…</div>;
  if (error || !jambData) return <div className="py-20 text-center text-rose-400">{error || 'Content unavailable.'}</div>;

  const subjects = jambData.subjects || [];
  const mockExam = exams.find((exam) => exam.id === 'jamb-full-mock');

  return (
    <div className="space-y-8 pb-16">
      <PageHeading
        eyebrow="JAMB practice"
        title="Choose a subject"
        description="Pick a syllabus topic to focus your revision, or practise the whole subject."
        back="Home"
        onBack={() => onNavigate('home')}
      />

      <section className="flex flex-col gap-4 rounded-3xl border border-emerald-500/20 bg-gradient-to-r from-emerald-900/30 to-slate-900 p-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">Exam conditions</p>
          <h2 className="mt-1 text-2xl font-black text-white">Full JAMB mock</h2>
          <p className="mt-1 text-sm text-slate-300">100 questions across English and core subjects. Timed CBT-style practice.</p>
        </div>
        <button
          disabled={!mockExam}
          onClick={() => mockExam && onStartExam(mockExam)}
          className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {mockExam ? 'Start full mock →' : 'Mock coming soon'}
        </button>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject, index) => (
          <button
            key={subject.slug}
            onClick={() => onNavigate('jamb-subject', { slug: subject.slug })}
            className="group rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:border-emerald-500/40 hover:bg-slate-900"
          >
            <span className="text-xs font-bold text-slate-500">{String(index + 1).padStart(2, '0')}</span>
            <h3 className="mt-2 text-lg font-bold text-white group-hover:text-emerald-300">{subject.name}</h3>
            <p className="mt-1 text-xs text-slate-400">{subject.topics.length} syllabus topics ↗</p>
          </button>
        ))}
      </div>
    </div>
  );
}

export function JambSubject({ data, exams, onNavigate, onStartExam }) {
  const slug = data?.slug;
  const { data: jambData, loading, error } = useJsonData('/data/jamb.json');

  if (loading) return <div className="py-20 text-center text-slate-400">Loading subject…</div>;
  if (error || !jambData) return <div className="py-20 text-center text-rose-400">{error || 'Content unavailable.'}</div>;

  const subject = (jambData.subjects || []).find((item) => item.slug === slug);
  if (!subject) return <div className="py-20 text-center text-rose-400">Subject not found.</div>;

  const wholeExam = exams.find((exam) => exam.id === `jamb-${slug}`);
  const findTopicExam = (topic) => exams.find((exam) => exam.id === `jamb-${slug}-${slugify(topic)}`);

  return (
    <div className="space-y-6 pb-16">
      <PageHeading
        eyebrow="JAMB syllabus"
        title={subject.name}
        description="Practise across the whole subject or focus on one syllabus topic."
        back="All subjects"
        onBack={() => onNavigate('jamb')}
      />

      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">All {subject.name}</h2>
            <p className="text-xs text-slate-300">Mixed questions across every topic</p>
          </div>
          <button
            disabled={!wholeExam}
            onClick={() => wholeExam && onStartExam(wholeExam)}
            className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
          >
            Practise subject →
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        <h2 className="border-b border-slate-800 px-5 py-4 text-lg font-bold text-white">Syllabus topics</h2>
        <div className="divide-y divide-slate-800">
          {subject.topics.map((topic) => {
            const exam = findTopicExam(topic);
            return (
              <div key={topic} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-semibold text-white">{topic}</h3>
                  <p className="text-xs text-slate-400">Topic practice · {exam ? `${exam.questionCount} questions` : 'no questions yet'}</p>
                </div>
                <button
                  disabled={!exam}
                  onClick={() => exam && onStartExam(exam)}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-emerald-500/40 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {exam ? 'Practise topic →' : 'Coming soon'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
