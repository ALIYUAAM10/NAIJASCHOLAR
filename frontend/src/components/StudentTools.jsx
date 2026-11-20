import React, { useEffect, useMemo, useState } from 'react';
import { slugify, useJsonData } from '../hooks/useJsonData';

function readStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage may be unavailable or full.
  }
}

function Heading({ eyebrow, title, description, onBack }) {
  return (
    <div className="mb-6">
      <button onClick={onBack} className="mb-3 text-sm font-semibold text-emerald-400 hover:text-emerald-300">← Home</button>
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">{description}</p>}
    </div>
  );
}

function dateValue(daysFromNow = 14) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function localDateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function makeSchedule(plan) {
  const blocks = { steady: 1, focused: 2, intensive: 3 }[plan.pace] || 1;
  const blockCount = Math.min(blocks, Math.max(1, Math.floor(plan.dailyMinutes / 15)));
  const baseMinutes = Math.floor(plan.dailyMinutes / blockCount);
  const ordered = [...plan.focus].sort((a, b) => a.confidence - b.confidence);
  const activities = {
    recall: ['Review briefly, then explain from memory', 'Write key ideas without notes', 'Check your recall and correct gaps'],
    practice: ['Try practice questions before reviewing notes', 'Review mistakes and solve a similar question', 'Do a short timed question set'],
    examples: ['Read a short explanation and work one example', 'Solve a similar example without looking', 'Summarise the method and check your steps'],
  }[plan.studyStyle] || [];
  const week = [];
  const start = new Date();
  let distribution = 7 - plan.daysPerWeek;
  let focusIndex = 0;

  for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
    const date = new Date(start);
    date.setDate(start.getDate() + dayIndex);
    distribution += plan.daysPerWeek;
    const isStudyDay = distribution >= 7;
    if (isStudyDay) distribution -= 7;
    const sessions = [];

    if (isStudyDay && ordered.length) {
      for (let blockIndex = 0; blockIndex < blockCount; blockIndex += 1) {
        const focus = ordered[focusIndex % ordered.length];
        focusIndex += 1;
        sessions.push({
          id: `${date.toISOString().slice(0, 10)}-${slugify(focus.key)}-${blockIndex}`,
          title: focus.label,
          minutes: baseMinutes + (blockIndex < plan.dailyMinutes % blockCount ? 1 : 0),
          activity: activities[blockIndex] || 'Review your focus area',
        });
      }
    }

    week.push({
      label: date.toLocaleDateString('en-NG', { weekday: 'long' }),
      dateLabel: date.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
      sessions,
      totalMinutes: sessions.reduce((sum, task) => sum + task.minutes, 0),
    });
  }

  return week;
}

export function Planner({ onBack }) {
  const [plan, setPlan] = useState(() => readStored('naija-study-plan', null));
  const [form, setForm] = useState(() => ({
    track: plan?.track || 'jamb',
    course: plan?.course || 'Computer Science',
    level: String(plan?.level || '200'),
    targetDate: plan?.targetDate || dateValue(),
    dailyMinutes: plan?.dailyMinutes || 60,
    daysPerWeek: plan?.daysPerWeek || 5,
    studyStyle: plan?.studyStyle || 'examples',
    pace: plan?.pace || 'steady',
    focus: plan?.focus || [],
  }));
  const [message, setMessage] = useState('');

  const jamb = useJsonData('/data/jamb.json');
  const units = useJsonData('/data/units.json');

  const focusOptions = useMemo(() => {
    if (form.track === 'jamb') {
      return (jamb.data?.subjects || []).map((subject) => ({
        key: `jamb:${subject.slug}`,
        label: subject.name,
      }));
    }
    const course = units.data?.courses?.find((item) => item.name === form.course);
    const courseUnits = course?.levels?.[form.level] || [];
    return [
      { key: `course:${slugify(form.course)}`, label: `${form.course} core topics` },
      ...courseUnits.map((unit) => ({ key: `unit:${slugify(unit.code)}`, label: `${unit.code} · ${unit.title}` })),
    ];
  }, [form.track, form.course, form.level, jamb.data, units.data]);

  const courses = useMemo(() => {
    const list = (units.data?.courses || []).map((item) => item.name);
    return [...new Set(list)];
  }, [units.data]);

  const chosen = new Set(form.focus.map((item) => item.key));

  useEffect(() => {
    if (!plan && focusOptions.length) {
      setForm((current) => ({
        ...current,
        focus: focusOptions.slice(0, current.track === 'jamb' ? 4 : 3).map((option) => ({ ...option, confidence: 3 })),
      }));
      setMessage('');
    }
  }, [focusOptions, plan]);

  function toggleFocus(option, checked, confidence = 3) {
    setForm((current) => {
      const rest = current.focus.filter((item) => item.key !== option.key);
      return {
        ...current,
        focus: checked ? [...rest, { ...option, confidence }] : rest,
      };
    });
  }

  function save(event) {
    event.preventDefault();
    if (!form.focus.length) {
      setMessage('Choose at least one subject or course unit to focus on.');
      return;
    }
    if (!form.targetDate || form.targetDate < dateValue(0)) {
      setMessage('Choose today or a future target date.');
      return;
    }
    const previousDone = new Set(plan?.completed || []);
    const next = {
      ...form,
      level: Number(form.level),
      dailyMinutes: Number(form.dailyMinutes),
      daysPerWeek: Number(form.daysPerWeek),
      schedule: makeSchedule({ ...form, level: Number(form.level), dailyMinutes: Number(form.dailyMinutes), daysPerWeek: Number(form.daysPerWeek) }),
    };
    next.completed = next.schedule.flatMap((day) => day.sessions).filter((task) => previousDone.has(task.id)).map((task) => task.id);
    setPlan(next);
    writeStored('naija-study-plan', next);
    setMessage('Study plan saved.');
  }

  function toggleTask(taskId) {
    if (!plan) return;
    const done = new Set(plan.completed || []);
    if (done.has(taskId)) done.delete(taskId);
    else done.add(taskId);
    const next = { ...plan, completed: [...done] };
    setPlan(next);
    writeStored('naija-study-plan', next);
  }

  function upgrade() {
    if (!plan) return;
    const order = ['steady', 'focused', 'intensive'];
    const current = order.indexOf(plan.pace);
    const next = {
      ...plan,
      pace: order[current === order.length - 1 ? 0 : current + 1],
      schedule: makeSchedule({ ...plan, pace: order[current === order.length - 1 ? 0 : current + 1] }),
    };
    next.completed = next.schedule.flatMap((day) => day.sessions).filter((task) => (plan.completed || []).includes(task.id)).map((task) => task.id);
    setPlan(next);
    writeStored('naija-study-plan', next);
  }

  const sessions = plan?.schedule?.flatMap((day) => day.sessions) || [];
  const done = plan?.completed || [];
  const finished = sessions.filter((task) => done.includes(task.id)).length;

  return (
    <div className="space-y-6 pb-16">
      <Heading eyebrow="Your time. Your pace." title="Build a study plan" description="Choose what you are studying, how much time you have, and where you want more practice." onBack={onBack} />

      {plan && (
        <section className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">This week · {plan.pace}</p>
              <p className="mt-1 text-2xl font-black text-white">{finished} / {sessions.length} study blocks complete</p>
            </div>
            <button onClick={upgrade} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400">
              {plan.pace === 'intensive' ? 'Switch to steady' : 'Upgrade pace'}
            </button>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
            <div className="h-full bg-emerald-400 transition-all" style={{ width: `${sessions.length ? Math.round((finished / sessions.length) * 100) : 0}%` }} />
          </div>
        </section>
      )}

      {plan && (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plan.schedule.map((day) => (
            <div key={day.label + day.dateLabel} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-white">{day.label}</p>
                  <p className="text-xs text-slate-500">{day.dateLabel}</p>
                </div>
                <span className="text-xs text-slate-400">{day.totalMinutes ? `${day.totalMinutes} min` : 'Rest'}</span>
              </div>
              <div className="mt-3 space-y-2">
                {day.sessions.length ? day.sessions.map((task) => (
                  <label key={task.id} className={`flex gap-3 rounded-xl border p-3 text-xs ${done.includes(task.id) ? 'border-emerald-500/30 bg-emerald-500/10 text-slate-300 line-through' : 'border-slate-800 bg-slate-950/50 text-slate-300'}`}>
                    <input type="checkbox" checked={done.includes(task.id)} onChange={() => toggleTask(task.id)} className="mt-0.5 accent-emerald-500" />
                    <span>
                      <strong className="block text-white">{task.title}</strong>
                      <span className="text-slate-500">{task.minutes} min · {task.activity}</span>
                    </span>
                  </label>
                )) : <p className="text-xs text-slate-500">Rest or take a short walk.</p>}
              </div>
            </div>
          ))}
        </section>
      )}

      <form onSubmit={save} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
        <h2 className="text-lg font-bold text-white">{plan ? 'Edit study preferences' : 'Study preferences'}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-slate-400">
            Preparing for
            <select value={form.track} onChange={(event) => setForm({ ...form, track: event.target.value, focus: [] })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">
              <option value="jamb">JAMB</option>
              <option value="university">University</option>
            </select>
          </label>
          {form.track === 'university' && (
            <>
              <label className="text-xs font-semibold text-slate-400">
                Degree programme
                <select value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value, focus: [] })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">
                  {courses.map((course) => <option key={course} value={course}>{course}</option>)}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-400">
                Current level
                <select value={form.level} onChange={(event) => setForm({ ...form, level: event.target.value, focus: [] })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">
                  {[100, 200, 300, 400, 500].map((level) => <option key={level} value={level}>{level} level</option>)}
                </select>
              </label>
            </>
          )}
          <label className="text-xs font-semibold text-slate-400">
            Target date
            <input type="date" min={dateValue(0)} value={form.targetDate} onChange={(event) => setForm({ ...form, targetDate: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" />
          </label>
          <label className="text-xs font-semibold text-slate-400">
            Study time per day
            <select value={form.dailyMinutes} onChange={(event) => setForm({ ...form, dailyMinutes: Number(event.target.value) })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">
              {[20, 30, 45, 60, 90, 120].map((minutes) => <option key={minutes} value={minutes}>{minutes} minutes</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-400">
            Days per week
            <select value={form.daysPerWeek} onChange={(event) => setForm({ ...form, daysPerWeek: Number(event.target.value) })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">
              {[3, 4, 5, 6, 7].map((days) => <option key={days} value={days}>{days} days</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-400">
            Study style
            <select value={form.studyStyle} onChange={(event) => setForm({ ...form, studyStyle: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">
              <option value="examples">Explanation, then examples</option>
              <option value="recall">Read, then recall from memory</option>
              <option value="practice">Practice questions first</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-400">
            Pace
            <select value={form.pace} onChange={(event) => setForm({ ...form, pace: event.target.value })} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">
              <option value="steady">Steady</option>
              <option value="focused">Focused</option>
              <option value="intensive">Intensive</option>
            </select>
          </label>
        </div>

        <fieldset>
          <legend className="text-sm font-bold text-white">Focus areas and confidence</legend>
          <p className="mt-1 text-xs text-slate-500">Confidence is a self-assessment, not a test.</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {focusOptions.map((option) => {
              const current = form.focus.find((item) => item.key === option.key);
              return (
                <label key={option.key} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-xs">
                  <input
                    type="checkbox"
                    checked={chosen.has(option.key)}
                    onChange={(event) => toggleFocus(option, event.target.checked, current?.confidence || 3)}
                    className="accent-emerald-500"
                  />
                  <span className="min-w-0 flex-1 truncate text-slate-200">{option.label}</span>
                  <select
                    value={current?.confidence || 3}
                    onChange={(event) => toggleFocus(option, true, Number(event.target.value))}
                    className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-300"
                  >
                    {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value}</option>)}
                  </select>
                </label>
              );
            })}
          </div>
        </fieldset>

        {message && <p className="text-xs font-semibold text-emerald-400">{message}</p>}
        <button type="submit" className="rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400">Save study plan →</button>
      </form>
    </div>
  );
}

export function Streak({ onBack }) {
  const [days, setDays] = useState(() => readStored('naija-streak', []));
  const today = localDateKey();

  function mark(undo = false) {
    const next = undo ? days.filter((day) => day !== today) : [...new Set([...days, today])].sort();
    setDays(next);
    writeStored('naija-streak', next);
  }

  function streakLength(list) {
    const set = new Set(list);
    let count = 0;
    const cursor = new Date();
    while (set.has(localDateKey(cursor))) {
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }

  function bestLength(list) {
    const sorted = [...new Set(list)].sort();
    let best = 0;
    let run = 0;
    let previous = null;
    for (const key of sorted) {
      const date = new Date(`${key}T00:00:00`);
      run = previous && Math.round((date - previous) / 86400000) === 1 ? run + 1 : 1;
      best = Math.max(best, run);
      previous = date;
    }
    return best;
  }

  const last28 = Array.from({ length: 28 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (27 - index));
    return { key: localDateKey(date), label: date.toLocaleDateString('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }) };
  });

  return (
    <div className="space-y-6 pb-16">
      <Heading eyebrow="Study streak" title="Keep the chain alive" description="Small daily sessions beat one long cram. Mark each day you study and watch your streak grow." onBack={onBack} />
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div><p className="text-3xl font-black text-emerald-400">{streakLength(days)}</p><p className="text-xs text-slate-400">current streak</p></div>
          <div><p className="text-3xl font-black text-white">{bestLength(days)}</p><p className="text-xs text-slate-400">best streak</p></div>
          <div><p className="text-3xl font-black text-white">{days.length}</p><p className="text-xs text-slate-400">total study days</p></div>
        </div>
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-300">{days.includes(today) ? 'Logged for today. Come back tomorrow to extend your streak.' : 'One session today keeps your streak alive.'}</p>
          <button onClick={() => mark(days.includes(today))} className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400">
            {days.includes(today) ? 'Undo today' : 'Mark today as studied'}
          </button>
        </div>
        <h2 className="mt-8 text-lg font-bold text-white">Last 28 days</h2>
        <div className="mt-3 grid grid-cols-7 gap-2">
          {last28.map((day) => (
            <span
              key={day.key}
              title={day.label}
              className={`flex aspect-square items-center justify-center rounded-lg border text-xs ${days.includes(day.key) ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300' : 'border-slate-800 bg-slate-950 text-slate-700'}`}
            >
              {days.includes(day.key) ? '✓' : ''}
            </span>
          ))}
        </div>
        <p className="mt-5 text-xs text-slate-500">Your streak is saved on this device only.</p>
      </section>
    </div>
  );
}

const GRADE_POINTS = { A: 5, B: 4, C: 3, D: 2, E: 1, F: 0 };

export function Cgpa({ onBack }) {
  const [courses, setCourses] = useState(() => readStored('naija-cgpa-courses', []));
  const [code, setCode] = useState('');
  const [units, setUnits] = useState(3);
  const [grade, setGrade] = useState('A');

  function persist(next) {
    setCourses(next);
    writeStored('naija-cgpa-courses', next);
  }

  function add(event) {
    event.preventDefault();
    const clean = code.trim();
    if (!clean || !(grade in GRADE_POINTS)) return;
    persist([...courses, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, code: clean, units: Math.min(6, Math.max(1, Number(units) || 3)), grade }]);
    setCode('');
  }

  const totalUnits = courses.reduce((sum, course) => sum + Number(course.units || 0), 0);
  const totalPoints = courses.reduce((sum, course) => sum + Number(course.units || 0) * (GRADE_POINTS[course.grade] ?? 0), 0);
  const gpa = totalUnits ? totalPoints / totalUnits : 0;
  const classification = gpa >= 4.5 ? 'First Class' : gpa >= 3.5 ? 'Second Class Upper' : gpa >= 2.4 ? 'Second Class Lower' : gpa >= 1.5 ? 'Third Class' : gpa > 0 ? 'Pass' : '—';

  return (
    <div className="space-y-6 pb-16">
      <Heading eyebrow="CGPA calculator" title="Estimate your GPA" description="Add each course, its credit units and your grade. This calculator uses the Nigerian 5-point scale." onBack={onBack} />
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <form onSubmit={add} className="grid gap-4 sm:grid-cols-4">
          <label className="text-xs font-semibold text-slate-400">Course code<input value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. CSC 201" className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" required /></label>
          <label className="text-xs font-semibold text-slate-400">Units<input type="number" min="1" max="6" value={units} onChange={(event) => setUnits(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white" required /></label>
          <label className="text-xs font-semibold text-slate-400">Grade<select value={grade} onChange={(event) => setGrade(event.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white">{Object.keys(GRADE_POINTS).map((item) => <option key={item} value={item}>{item} ({GRADE_POINTS[item]})</option>)}</select></label>
          <button type="submit" className="self-end rounded-xl bg-emerald-500 px-4 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400">Add course</button>
        </form>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><p className="text-2xl font-black text-emerald-400">{gpa.toFixed(2)}</p><p className="text-xs text-slate-400">GPA</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><p className="text-2xl font-black text-white">{totalUnits}</p><p className="text-xs text-slate-400">total units</p></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><p className="text-lg font-black text-white">{classification}</p><p className="text-xs text-slate-400">estimated class</p></div>
        </div>

        <div className="mt-6 space-y-2">
          {courses.length ? courses.map((course) => (
            <div key={course.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm">
              <span className="font-bold text-white">{course.code}</span>
              <span className="text-slate-400">{course.units} units</span>
              <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-400">{course.grade}</span>
              <button onClick={() => persist(courses.filter((item) => item.id !== course.id))} className="text-xs text-rose-400 hover:text-rose-300">Remove</button>
            </div>
          )) : <p className="text-sm text-slate-500">No courses added yet.</p>}
        </div>
        {courses.length > 0 && (
          <button onClick={() => persist([])} className="mt-4 text-xs font-semibold text-slate-400 hover:text-rose-400">Clear all courses</button>
        )}
        <p className="mt-6 text-xs text-slate-500">This is an estimate. Confirm your official CGPA with your department.</p>
      </section>
    </div>
  );
}

export function Contribute({ onBack }) {
  return (
    <div className="space-y-6 pb-16">
      <Heading eyebrow="Open contribution" title="Help another student practise" description="Contribute original questions that you wrote, or material you have permission to share. Do not upload copied exam papers." onBack={onBack} />
      <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6">
        <h2 className="text-lg font-bold text-white">How to contribute on GitHub</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-300">
          <li>Fork the project repository and create a branch.</li>
          <li>Add original questions to <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">frontend/public/data/jamb/</code> or <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">frontend/public/data/questions/</code>.</li>
          <li>Run the app locally and check your question format.</li>
          <li>Open a pull request describing the source and review status.</li>
        </ol>
        <pre className="mt-5 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4 text-xs text-slate-300">{`{
  "id": "CSC201-001",
  "topic": "Programming fundamentals",
  "q": "Write an original question here.",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "answer": 0,
  "explanation": "Explain why the answer is correct."
}`}</pre>
        <a href="https://github.com/ALIYUAAM10/NAIJASCHOLAR" target="_blank" rel="noreferrer" className="mt-5 inline-block rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400">Open project on GitHub ↗</a>
      </section>
    </div>
  );
}
