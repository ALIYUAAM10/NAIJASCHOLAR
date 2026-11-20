import React, { useEffect, useState } from 'react';
import { api } from '../services/api';

function formatDate(value, withTime = false) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(undefined, withTime
    ? { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { month: 'short', day: 'numeric', year: 'numeric' });
}

function InfoRow({ label, value, icon }) {
  return (
    <div className="profile-field radius-sm flex items-start gap-3 px-4 py-3">
      <span className="text-base" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">{label}</div>
        <div className="mt-0.5 truncate text-sm font-bold text-slate-800">{value || '—'}</div>
      </div>
    </div>
  );
}

export default function Profile({ profile, dashboard, onNavigate, onProfileUpdated }) {
  const [username, setUsername] = useState(profile?.username || '');
  const [leaderboard, setLeaderboard] = useState(Boolean(profile?.leaderboardOptIn));
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setUsername(profile?.username || '');
    setLeaderboard(Boolean(profile?.leaderboardOptIn));
  }, [profile?.username, profile?.leaderboardOptIn]);

  const overall = dashboard?.stats || {};
  const attempts = dashboard?.recentAttempts || [];
  const progress = dashboard?.progress || {};

  const accuracy = overall.totalQuestions
    ? Math.round((overall.correctAnswers || 0) / overall.totalQuestions * 100)
    : 0;

  const progressEntries = Object.entries(progress)
    .map(([key, value]) => ({ key, name: key.replace(/[-_]/g, ' '), ...value }))
    .filter((entry) => entry.attempts > 0)
    .sort((a, b) => b.averagePercentage - a.averagePercentage)
    .slice(0, 4);

  const displayName = profile?.username || profile?.displayName || 'Student';
  const initials = displayName.charAt(0).toUpperCase();
  const showPhoto = Boolean(profile?.photoURL) && !avatarFailed;

  const stats = [
    { icon: '✅', label: 'Completed exams', value: overall.completedExams || 0 },
    { icon: '🎯', label: 'Average score', value: `${Number(overall.averagePercentage || 0).toFixed(1)}%` },
    { icon: '🧠', label: 'Answer accuracy', value: `${accuracy}%` },
    { icon: '📝', label: 'Total questions', value: overall.totalQuestions || 0 },
  ];

  const handleSave = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      const response = await api.updateProfile({
        username: username.trim(),
        leaderboardOptIn: leaderboard,
      });
      onProfileUpdated?.(response.user);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page space-y-6 pb-16">
      <section className="profile-panel profile-cover radius-xl relative overflow-hidden p-6 sm:p-9">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/45 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-cyan-200/35 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div className="flex items-center gap-5">
            <div className="profile-avatar radius-lg flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden text-2xl font-black text-[#fff] sm:h-24 sm:w-24 sm:text-3xl">
              {showPhoto ? (
                <img
                  src={profile.photoURL}
                  alt=""
                  className="radius-lg h-full w-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                initials
              )}
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Student profile</p>
              <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {displayName}
              </h1>
              <p className="mt-1 truncate text-sm text-slate-600">{profile?.email || 'No email on file'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="profile-field radius-xs px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  {profile?.state || 'Nigeria'}
                </span>
                <span className="profile-field radius-xs px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Member since {formatDate(profile?.createdAt)}
                </span>
                <span className="profile-field radius-xs px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  {profile?.leaderboardOptIn ? 'Leaderboard on' : 'Private mode'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => document.getElementById('profile-settings')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="glass-button-primary radius-sm px-5 py-3 text-sm font-bold text-[#fff]"
            >
              Edit profile
            </button>
            <button
              type="button"
              onClick={() => onNavigate('explore')}
              className="glass-button radius-sm px-5 py-3 text-sm font-bold text-indigo-700"
            >
              Explore tools
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <article key={item.label} className="profile-panel radius-lg p-5">
            <div className="flex items-start justify-between">
              <span className="text-xl" aria-hidden="true">{item.icon}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">total</span>
            </div>
            <div className="mt-4 text-2xl font-black tracking-tight text-slate-900">{item.value}</div>
            <div className="mt-1 text-xs font-semibold text-slate-500">{item.label}</div>
          </article>
        ))}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="profile-panel radius-lg p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Account details</h2>
              <p className="mt-1 text-xs text-slate-500">Your Naija Scholar identity and study targets.</p>
            </div>
            <span className="profile-field radius-xs px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              ID {profile?.uid ? profile.uid.slice(0, 8) : '—'}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InfoRow label="Username" value={profile?.username} icon="👤" />
            <InfoRow label="Email" value={profile?.email} icon="✉️" />
            <InfoRow label="State" value={profile?.state} icon="📍" />
            <InfoRow label="Timezone" value={profile?.timezone} icon="🌍" />
            <InfoRow label="Target exam" value={profile?.targetExamId} icon="🎯" />
            <InfoRow label="Target course" value={profile?.targetCourseId} icon="🎓" />
            <InfoRow label="Last updated" value={formatDate(profile?.updatedAt, true)} icon="🕒" />
            <InfoRow label="Study mode" value={profile?.leaderboardOptIn ? 'Leaderboard' : 'Private'} icon="🔐" />
          </div>
        </section>

        <section id="profile-settings" className="profile-panel radius-lg scroll-mt-40 p-6">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">Profile settings</h2>
            <p className="mt-1 text-xs text-slate-500">Update the details that other students can see.</p>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-4">
            <div>
              <label htmlFor="profile-username" className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Username
              </label>
              <input
                id="profile-username"
                required
                minLength={3}
                maxLength={30}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="profile-field radius-sm w-full px-4 py-3 text-sm font-semibold text-slate-800 outline-none"
                placeholder="Your display name"
              />
            </div>

            <div className="profile-field radius-sm flex items-center justify-between gap-4 p-4">
              <div>
                <div className="text-sm font-bold text-slate-800">Leaderboard</div>
                <div className="mt-0.5 text-[11px] text-slate-500">Show your progress to other students.</div>
              </div>
              <button
                type="button"
                onClick={() => setLeaderboard((value) => !value)}
                aria-pressed={leaderboard}
                aria-label="Toggle leaderboard visibility"
                className={`profile-toggle radius-xs shrink-0 ${leaderboard ? 'is-on' : ''}`}
              />
            </div>

            {message && (
              <div className="radius-sm border border-emerald-300/70 bg-emerald-50/80 px-4 py-3 text-xs font-semibold text-emerald-700">
                {message}
              </div>
            )}
            {error && (
              <div className="radius-sm border border-red-300/70 bg-red-50/80 px-4 py-3 text-xs font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="glass-button-primary radius-sm w-full py-3 text-sm font-bold text-[#fff] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="profile-panel radius-lg p-6">
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
                    <div className="radius-xs mt-2 h-2 overflow-hidden bg-white/70">
                      <div
                        className="radius-xs h-full bg-gradient-to-r from-indigo-500 to-indigo-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="profile-field radius-md mt-5 p-5 text-center text-xs text-slate-600">
              Complete a mock to unlock subject-level progress.
            </div>
          )}
        </section>

        <section className="profile-panel radius-lg p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Recent attempts</h2>
              <p className="mt-1 text-xs text-slate-500">Your latest server-graded sessions.</p>
            </div>
            <button onClick={() => onNavigate('practice')} className="text-xs font-bold text-indigo-600 hover:underline">
              View all
            </button>
          </div>

          {attempts.length > 0 ? (
            <div className="mt-5 space-y-3">
              {attempts.slice(0, 4).map((attempt) => (
                <div key={attempt.id} className="profile-field radius-sm flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-bold text-slate-800">{attempt.title}</div>
                    <div className="mt-0.5 text-[10px] text-slate-500">
                      {attempt.subject} • {formatDate(attempt.completedAt, true)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-black text-slate-900">{attempt.score}/{attempt.totalQuestions}</div>
                    <div className="text-[10px] font-bold text-emerald-600">{Math.round(attempt.percentage || 0)}%</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="profile-field radius-md mt-5 p-5 text-center text-xs text-slate-600">
              No attempts yet. Start a mock to build your history.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
