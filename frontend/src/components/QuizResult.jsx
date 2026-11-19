import React from 'react';

export default function QuizResult({ result, quiz, questions, onReturnDashboard }) {
  const { score, totalQuestions, percentage, review } = result;

  const isPassed = percentage >= 50;

  // Build lookup map for question text
  const questionMap = questions.reduce((acc, q) => {
    acc[q.id] = q.text;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      {/* Score Summary Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-6 md:p-8 text-center relative overflow-hidden shadow-2xl">
        <div className="inline-flex rounded-full bg-slate-800 border border-slate-700 px-3.5 py-1 text-xs font-semibold text-slate-300 mb-4">
          Quiz Completed • {quiz?.title}
        </div>

        <div className="mb-4">
          <div className="inline-flex items-baseline gap-2">
            <span className="text-5xl md:text-6xl font-black text-white">{score}</span>
            <span className="text-xl font-bold text-slate-500">/ {totalQuestions}</span>
          </div>
        </div>

        <div className="inline-block rounded-2xl bg-slate-950/70 border border-slate-800 px-6 py-3 mb-6">
          <div className={`text-2xl font-black ${isPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
            {percentage}% Score
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {isPassed ? '🎉 Excellent performance! Passed.' : '⚠️ Keep practicing to improve your score.'}
          </p>
        </div>

        <div>
          <button
            onClick={onReturnDashboard}
            className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-6 py-3 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-300 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {/* Score by topic */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="mb-3 text-sm font-bold text-white">Score by subject</h3>
          <div className="space-y-2">
            {[...new Set(questions.map((question) => question.topic.split(' · ')[0] || quiz?.subject || 'Practice'))].map((subject) => {
              const ids = new Set(questions.filter((question) => (question.topic.split(' · ')[0] || quiz?.subject || 'Practice') === subject).map((question) => question.id));
              const items = review.filter((item) => ids.has(item.questionId));
              const correct = items.filter((item) => item.isCorrect).length;
              return (
                <div key={subject} className="flex items-center justify-between rounded-xl bg-slate-950/60 px-3 py-2 text-xs">
                  <span className="text-slate-300">{subject}</span>
                  <span className="font-bold text-white">{correct} / {items.length}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
          <h3 className="mb-3 text-sm font-bold text-white">Study next</h3>
          <div className="space-y-2">
            {[...new Set(questions.map((question) => question.topic))]
              .map((topic) => {
                const ids = new Set(questions.filter((question) => question.topic === topic).map((question) => question.id));
                const items = review.filter((item) => ids.has(item.questionId));
                const correct = items.filter((item) => item.isCorrect).length;
                return { topic, correct, total: items.length };
              })
              .filter((item) => item.correct < item.total)
              .sort((a, b) => a.correct / a.total - b.correct / b.total)
              .slice(0, 5)
              .map((item) => (
                <div key={item.topic} className="flex items-center justify-between rounded-xl bg-rose-500/5 px-3 py-2 text-xs">
                  <span className="text-slate-300">{item.topic}</span>
                  <span className="font-bold text-rose-300">{item.correct}/{item.total} correct</span>
                </div>
              ))}
            {!review.some((item) => !item.isCorrect) && <p className="text-xs text-slate-400">Strong work. Keep revising across your syllabus.</p>}
          </div>
        </div>
      </div>

      {/* Answer Review Section */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
          Detailed Question Review
        </h3>

        <div className="space-y-4">
          {review.map((item, index) => {
            const questionText = questionMap[item.questionId] || `Question ${index + 1}`;
            return (
              <div
                key={item.questionId}
                className={`rounded-2xl border p-4 transition ${
                  item.isCorrect
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-rose-500/30 bg-rose-500/5'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="text-sm font-semibold text-white leading-snug">
                    {index + 1}. {questionText}
                  </h4>
                  <span
                    className={`shrink-0 rounded-md px-2.5 py-0.5 text-[11px] font-extrabold uppercase border ${
                      item.isCorrect
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {item.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>

                <div className="grid gap-2 text-xs font-medium sm:grid-cols-2">
                  <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">Your Choice:</span>
                    <span className={item.isCorrect ? 'text-emerald-300 font-bold' : 'text-rose-300 font-bold'}>
                      {item.selectedOption || '(No answer provided)'}
                    </span>
                  </div>

                  <div className="rounded-xl bg-slate-950/60 p-2.5 border border-slate-800/80">
                    <span className="text-slate-400 block mb-0.5">Correct Answer:</span>
                    <span className="text-emerald-400 font-bold">{item.correctOption}</span>
                  </div>
                </div>

                {item.explanation && (
                  <div className="mt-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3">
                    <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Explanation
                    </span>
                    <p className="text-xs leading-relaxed text-slate-300">{item.explanation}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
