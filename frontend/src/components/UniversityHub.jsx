import React, { useMemo, useState } from 'react';
import { slugify, useJsonData } from '../hooks/useJsonData';

function Heading({ eyebrow, title, description, back, onBack }) {
  return (
    <div className="mb-6">
      {back && (
        <button onClick={onBack} className="mb-3 text-sm font-semibold text-emerald-400 hover:text-emerald-300">
          ← {back}
        </button>
      )}
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-400">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-black text-white">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-sm text-slate-400">{description}</p>}
    </div>
  );
}

function useContent() {
  const faculties = useJsonData('/data/faculties.json');
  const units = useJsonData('/data/units.json');
  const loading = faculties.loading || units.loading;
  const error = faculties.error || units.error;
  return { faculties: faculties.data?.faculties || [], units: units.data, loading, error };
}

export default function UniversityHub({ data, exams, onNavigate, onStartExam }) {
  const { faculties, units, loading, error } = useContent();
  const [query, setQuery] = useState('');

  if (loading) return <div className="py-20 text-center text-slate-400">Loading university courses…</div>;
  if (error || !units) return <div className="py-20 text-center text-red-400">{error || 'Content unavailable.'}</div>;

  const allCourses = faculties.flatMap((faculty) =>
    faculty.courses.map((course) => ({ name: course, faculty: faculty.name })),
  );
  const allUnits = [
    ...(units.gst || []),
    ...units.courses.flatMap((course) => Object.values(course.levels || {}).flat()),
  ];
  const normalized = query.trim().toLowerCase();
  const courseMatches = normalized
    ? allCourses.filter((course) => course.name.toLowerCase().includes(normalized)).slice(0, 8)
    : [];
  const unitMatches = normalized
    ? allUnits.filter((unit) => `${unit.code} ${unit.title}`.toLowerCase().includes(normalized)).slice(0, 8)
    : [];

  return (
    <div className="space-y-8 pb-16">
      <Heading
        eyebrow="University practice"
        title="Find your course"
        description="Browse faculties, search course names and unit codes, then practise by level."
        back="Home"
        onBack={() => onNavigate('home')}
      />

      <div className="relative">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search e.g. Computer Science, CSC 201"
          className="w-full rounded-2xl border border-slate-700 bg-slate-900/80 px-5 py-4 pl-12 text-sm text-white placeholder:text-slate-500 focus:border-indigo-400 focus:outline-none"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-500">⌕</span>
        {normalized && (
          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
            {[...courseMatches.map((course) => (
              <button
                key={`course-${course.name}`}
                onClick={() => onNavigate('university-course', { course: course.name })}
                className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-800"
              >
                <span>
                  <span className="block text-sm font-bold text-white">{course.name}</span>
                  <span className="text-xs text-slate-400">{course.faculty}</span>
                </span>
                <span className="text-slate-500">↗</span>
              </button>
            )), ...unitMatches.map((unit) => {
              const exam = exams.find((item) => item.id === `course-${slugify(unit.code)}`);
              return (
                <button
                  key={`unit-${unit.code}`}
                  disabled={!exam}
                  onClick={() => exam && onStartExam(exam)}
                  className="flex w-full items-center justify-between px-5 py-3 text-left hover:bg-slate-800 disabled:opacity-50"
                >
                  <span>
                    <span className="block text-sm font-bold text-white">{unit.code} · {unit.title}</span>
                    <span className="text-xs text-slate-400">Course unit</span>
                  </span>
                  <span className="text-xs text-emerald-400">{exam ? 'Practise →' : 'No questions'}</span>
                </button>
              );
            })]}
            {!courseMatches.length && !unitMatches.length && (
              <p className="px-5 py-4 text-sm text-slate-400">No matching course or unit.</p>
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold text-white">Faculties</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {faculties.map((faculty, index) => (
            <button
              key={faculty.name}
              onClick={() => onNavigate('university-faculty', { index })}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-left transition hover:border-indigo-500/40"
            >
              <span className="text-xs font-bold text-slate-500">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 font-bold text-white">{faculty.name}</h3>
              <p className="mt-1 text-xs text-slate-400">{faculty.courses.length} programmes ↗</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-white">General Studies (GST)</h2>
          <p className="text-xs text-slate-300">Shared course units for students across faculties</p>
        </div>
        <button
          onClick={() => onNavigate('university-gst')}
          className="rounded-xl border border-indigo-400/40 bg-indigo-500/20 px-4 py-2 text-xs font-bold text-indigo-200 hover:bg-indigo-500/30"
        >
          Browse GST units →
        </button>
      </div>
    </div>
  );
}

export function UniversityFaculty({ data, onNavigate }) {
  const { faculties, loading, error } = useContent();
  if (loading) return <div className="py-20 text-center text-slate-400">Loading faculty…</div>;
  if (error) return <div className="py-20 text-center text-red-400">{error}</div>;
  const faculty = faculties[Number(data?.index)];
  if (!faculty) return <div className="py-20 text-center text-red-400">Faculty not found.</div>;

  return (
    <div className="space-y-6 pb-16">
      <Heading eyebrow="Faculty" title={faculty.name} description="Choose a degree programme." back="Faculties" onBack={() => onNavigate('university')} />
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        {faculty.courses.map((course) => (
          <button
            key={course}
            onClick={() => onNavigate('university-course', { course })}
            className="flex w-full items-center justify-between border-b border-slate-800 px-5 py-4 text-left last:border-0 hover:bg-slate-800/60"
          >
            <span className="font-semibold text-white">{course}</span>
            <span className="text-slate-500">↗</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function UniversityCourse({ data, onNavigate }) {
  const course = data?.course;
  const levels = course === 'Medicine and Surgery' ? [100, 200, 300, 400, 500, 600] : [100, 200, 300, 400, 500];
  return (
    <div className="space-y-6 pb-16">
      <Heading eyebrow="Degree programme" title={course || 'Course'} description="Choose your current level." back="Courses" onBack={() => onNavigate('university')} />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {levels.map((level) => (
          <button
            key={level}
            onClick={() => onNavigate('university-level', { course, level })}
            className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-center transition hover:border-indigo-500/40"
          >
            <span className="block text-3xl font-black text-white">{level}</span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Level</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function UnitRow({ unit, exam, onStartExam }) {
  return (
    <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <strong className="text-white">{unit.code}</strong>
        <span className="ml-3 text-sm text-slate-400">{unit.title}</span>
      </div>
      <button
        disabled={!exam}
        onClick={() => exam && onStartExam(exam)}
        className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:border-emerald-500/40 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {exam ? 'Practise →' : 'No questions yet'}
      </button>
    </div>
  );
}

export function UniversityLevel({ data, exams, onNavigate, onStartExam }) {
  const { units, loading, error } = useContent();
  if (loading) return <div className="py-20 text-center text-slate-400">Loading course units…</div>;
  if (error || !units) return <div className="py-20 text-center text-red-400">{error || 'Content unavailable.'}</div>;

  const course = units.courses.find((item) => item.name === data?.course);
  const levelUnits = course?.levels?.[String(data?.level)] || [];
  const gst = units.gst || [];
  const examFor = (unit) => exams.find((exam) => exam.id === `course-${slugify(unit.code)}`);

  return (
    <div className="space-y-8 pb-16">
      <Heading
        eyebrow={`${data?.level} level`}
        title={`${data?.course} course units`}
        description="Choose a unit to practise. Units without question sets are ready for contributions."
        back={data?.course || 'Course'}
        onBack={() => onNavigate('university-course', { course: data?.course })}
      />
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        <h2 className="border-b border-slate-800 px-5 py-4 text-lg font-bold text-white">Core units</h2>
        {levelUnits.length ? levelUnits.map((unit) => (
          <UnitRow key={unit.code} unit={unit} exam={examFor(unit)} onStartExam={onStartExam} />
        )) : <p className="px-5 py-6 text-sm text-slate-400">No course units have been added for this programme and level yet.</p>}
      </section>
      <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        <h2 className="border-b border-slate-800 px-5 py-4 text-lg font-bold text-white">General Studies</h2>
        {gst.map((unit) => <UnitRow key={unit.code} unit={unit} exam={examFor(unit)} onStartExam={onStartExam} />)}
      </section>
    </div>
  );
}

export function UniversityGst({ exams, onNavigate, onStartExam }) {
  const { units, loading, error } = useContent();
  if (loading) return <div className="py-20 text-center text-slate-400">Loading GST units…</div>;
  if (error || !units) return <div className="py-20 text-center text-red-400">{error || 'Content unavailable.'}</div>;
  const examFor = (unit) => exams.find((exam) => exam.id === `course-${slugify(unit.code)}`);

  return (
    <div className="space-y-6 pb-16">
      <Heading eyebrow="For every student" title="General Studies units" back="University" onBack={() => onNavigate('university')} />
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70">
        {(units.gst || []).map((unit) => <UnitRow key={unit.code} unit={unit} exam={examFor(unit)} onStartExam={onStartExam} />)}
      </div>
    </div>
  );
}
