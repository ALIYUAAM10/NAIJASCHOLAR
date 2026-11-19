import React, { useEffect, useState } from 'react';

export default function QuizSession({ quiz, questions, answers, setAnswers, onSubmit, timer, submitting = false }) {
  const [index, setIndex] = useState(0);
  const totalCount = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalCount > 0 ? (answeredCount / totalCount) * 100 : 0;
  const current = questions[index];
  const isLowTime = timer.minutes === 0 && timer.seconds < 60;

  useEffect(() => {
    setIndex(0);
  }, [quiz?.id]);

  if (!current) {
    return <div className="py-20 text-center text-slate-400">No questions available.</div>;
  }

  function choose(option) {
    setAnswers({ ...answers, [current.id]: option });
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-12">
      <div className="sticky top-16 z-40 rounded-2xl border border-slate-800 bg-slate-900/95 p-4 shadow-xl backdrop-blur-md">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              {quiz?.examType || quiz?.subject} Quiz Session
            </span>
            <h2 className="text-lg font-bold text-white leading-tight">{quiz?.title}</h2>
          </div>
          <div className={`flex items-center gap-2 self-start rounded-xl px-4 py-2 text-sm font-black border transition-all ${isLowTime ? 'bg-rose-500/10 border-rose-500/40 text-rose-400 animate-pulse' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'}`}>
            <span>⏱️ Time Left:</span>
            <span className="text-base font-mono">
              {String(timer.minutes).padStart(2, '0')}:{String(timer.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-xs text-slate-400 mb-1.5 font-medium">
            <span>Progress: {answeredCount} of {totalCount} answered</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_260px]">
        <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 md:p-7">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <span>Question {index + 1} of {totalCount}</span>
            <span className="rounded-md bg-slate-800 px-2 py-1 text-emerald-300">{current.topic}</span>
          </div>
          <h3 className="mt-5 text-lg font-semibold leading-relaxed text-white md:text-xl">{current.text}</h3>

          <div className="mt-6 grid gap-3">
            {(current.options || []).map((option, optIndex) => {
              const letter = String.fromCharCode(65 + optIndex);
              const selected = answers[current.id] === option;
              return (
                <label
                  key={optIndex}
                  className={`group flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all ${selected ? 'border-emerald-500 bg-emerald-500/10 text-white font-medium shadow-md shadow-emerald-500/10' : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-950'}`}
                >
                  <input type="radio" name={`question-${current.id}`} checked={selected} onChange={() => choose(option)} className="sr-only" />
                  <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-bold text-xs transition ${selected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'}`}>{letter}</span>
                  <span className="text-sm leading-snug">{option}</span>
                </label>
              );
            })}
          </div>
        </article>

        <aside className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h4 className="text-sm font-bold text-white">Question palette</h4>
          <p className="mt-1 text-xs text-slate-500">Jump to any question</p>
          <div className="mt-4 grid max-h-[420px] grid-cols-6 gap-2 overflow-y-auto pr-1 sm:grid-cols-7 lg:grid-cols-5">
            {questions.map((question, qIndex) => (
              <button
                key={question.id}
                onClick={() => setIndex(qIndex)}
                className={`flex h-9 items-center justify-center rounded-lg border text-xs font-bold transition ${qIndex === index ? 'border-emerald-400 bg-emerald-500 text-slate-950' : answers[question.id] ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'}`}
              >
                {qIndex + 1}
              </button>
            ))}
          </div>
          <div className="mt-5 flex gap-2">
            <button onClick={() => setIndex(Math.max(0, index - 1))} disabled={index === 0} className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-200 disabled:opacity-40">Previous</button>
            <button onClick={() => setIndex(Math.min(totalCount - 1, index + 1))} disabled={index >= totalCount - 1} className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-2.5 text-xs font-bold text-slate-200 disabled:opacity-40">Next</button>
          </div>
        </aside>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 text-center">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-teal-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : `Submit Quiz Answers (${answeredCount}/${totalCount} Completed)`}
        </button>
      </div>
    </div>
  );
}
