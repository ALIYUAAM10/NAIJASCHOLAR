import { Timestamp } from 'firebase-admin/firestore';
import type { AuthUser } from './auth';
import { getDb } from './firebase-admin';

export interface OverallStats {
  completedExams: number;
  totalQuestions: number;
  correctAnswers: number;
  averagePercentage: number;
  lastAttemptAt: string | null;
}

export interface SubjectProgress {
  attempts: number;
  correctAnswers: number;
  totalQuestions: number;
  averagePercentage: number;
  lastAttemptAt: string | null;
}

export interface AttemptSummary {
  id: string;
  examId: string;
  title: string;
  subject: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

export interface ProfileState {
  username: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  timezone: string;
  state: string | null;
  targetExamId: string | null;
  targetUniversityId: string | null;
  targetCourseId: string | null;
  subjectIds: string[];
  leaderboardOptIn: boolean;
  stats: OverallStats;
  progress: Record<string, SubjectProgress>;
  recentAttempts: AttemptSummary[];
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProfileResponse extends ProfileState {
  uid: string;
}

export function emptyStats(): OverallStats {
  return {
    completedExams: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    averagePercentage: 0,
    lastAttemptAt: null,
  };
}

export function emptySubjectProgress(): SubjectProgress {
  return {
    attempts: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    averagePercentage: 0,
    lastAttemptAt: null,
  };
}

export function averagePercentage(
  correctAnswers: number,
  totalQuestions: number,
): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((correctAnswers / totalQuestions) * 1_000) / 10;
}

export function deriveUsername(
  name: string | undefined,
  email: string | undefined,
  uid: string,
): string {
  const source = (name ?? email?.split('@')[0] ?? '').trim();
  const cleaned = source
    .replace(/[^A-Za-z0-9 _.-]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 30)
    .trim();

  return cleaned.length >= 3 ? cleaned : `student-${uid.slice(0, 8)}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

function asNullableString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function asBoolean(value: unknown): boolean {
  return value === true;
}

function timestampToIso(value: unknown): string | null {
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return new Date(value).toISOString();
  return null;
}

function normalizeStats(value: unknown): OverallStats {
  const data = asRecord(value);
  return {
    completedExams: asNumber(data.completedExams),
    totalQuestions: asNumber(data.totalQuestions),
    correctAnswers: asNumber(data.correctAnswers),
    averagePercentage: asNumber(data.averagePercentage),
    lastAttemptAt: asNullableString(data.lastAttemptAt),
  };
}

function normalizeSubjectProgress(value: unknown): SubjectProgress {
  const data = asRecord(value);
  return {
    attempts: asNumber(data.attempts),
    correctAnswers: asNumber(data.correctAnswers),
    totalQuestions: asNumber(data.totalQuestions),
    averagePercentage: asNumber(data.averagePercentage),
    lastAttemptAt: asNullableString(data.lastAttemptAt),
  };
}

function normalizeProgress(value: unknown): Record<string, SubjectProgress> {
  const data = asRecord(value);
  const result: Record<string, SubjectProgress> = {};

  for (const [subject, item] of Object.entries(data)) {
    result[subject] = normalizeSubjectProgress(item);
  }

  return result;
}

function normalizeAttempt(value: unknown): AttemptSummary | null {
  const data = asRecord(value);
  const id = asNullableString(data.id);
  const examId = asNullableString(data.examId);
  const title = asNullableString(data.title);
  const subject = asNullableString(data.subject);
  const completedAt = asNullableString(data.completedAt);

  if (!id || !examId || !title || !subject || !completedAt) return null;

  return {
    id,
    examId,
    title,
    subject,
    score: asNumber(data.score),
    totalQuestions: asNumber(data.totalQuestions),
    percentage: asNumber(data.percentage),
    completedAt,
  };
}

function normalizeAttempts(value: unknown): AttemptSummary[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeAttempt)
    .filter((attempt): attempt is AttemptSummary => attempt !== null)
    .slice(0, 10);
}

export function defaultProfile(user: AuthUser): ProfileState {
  const now = new Date().toISOString();
  return {
    username: deriveUsername(user.token.name, user.email, user.uid),
    email: user.email ?? null,
    displayName: user.token.name ?? null,
    photoURL: user.token.picture ?? null,
    timezone: 'Africa/Lagos',
    state: null,
    targetExamId: null,
    targetUniversityId: null,
    targetCourseId: null,
    subjectIds: [],
    leaderboardOptIn: false,
    stats: emptyStats(),
    progress: {},
    recentAttempts: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function normalizeProfile(
  data: Record<string, unknown>,
  user: AuthUser,
): ProfileState {
  return {
    username: asString(
      data.username,
      deriveUsername(user.token.name, user.email, user.uid),
    ),
    email: asNullableString(data.email) ?? user.email ?? null,
    displayName: asNullableString(data.displayName) ?? user.token.name ?? null,
    photoURL: asNullableString(data.photoURL) ?? user.token.picture ?? null,
    timezone: asString(data.timezone, 'Africa/Lagos'),
    state: asNullableString(data.state),
    targetExamId: asNullableString(data.targetExamId),
    targetUniversityId: asNullableString(data.targetUniversityId),
    targetCourseId: asNullableString(data.targetCourseId),
    subjectIds: Array.isArray(data.subjectIds)
      ? data.subjectIds.filter((item): item is string => typeof item === 'string')
      : [],
    leaderboardOptIn: asBoolean(data.leaderboardOptIn),
    stats: normalizeStats(data.stats),
    progress: normalizeProgress(data.progress),
    recentAttempts: normalizeAttempts(data.recentAttempts),
    createdAt: timestampToIso(data.createdAt),
    updatedAt: timestampToIso(data.updatedAt),
  };
}

export function profileFields(
  profile: ProfileState,
): Record<string, unknown> {
  return {
    username: profile.username,
    email: profile.email,
    displayName: profile.displayName,
    photoURL: profile.photoURL,
    timezone: profile.timezone,
    state: profile.state,
    targetExamId: profile.targetExamId,
    targetUniversityId: profile.targetUniversityId,
    targetCourseId: profile.targetCourseId,
    subjectIds: profile.subjectIds,
    leaderboardOptIn: profile.leaderboardOptIn,
    stats: profile.stats,
    progress: profile.progress,
    recentAttempts: profile.recentAttempts,
  };
}

export async function ensureProfile(
  uid: string,
  user: AuthUser,
): Promise<{ profile: ProfileState; created: boolean }> {
  const ref = getDb().collection('users').doc(uid);
  const snapshot = await ref.get();

  if (snapshot.exists) {
    return {
      profile: normalizeProfile(snapshot.data() ?? {}, user),
      created: false,
    };
  }

  const profile = defaultProfile(user);
  const now = Timestamp.now();

  await ref.set({
    ...profileFields(profile),
    createdAt: now,
    updatedAt: now,
  });

  return { profile, created: true };
}

export function toProfileResponse(
  uid: string,
  user: AuthUser,
  profile: ProfileState,
): ProfileResponse {
  return {
    uid,
    ...profile,
    email: profile.email ?? user.email ?? null,
    displayName: profile.displayName ?? user.token.name ?? null,
    photoURL: profile.photoURL ?? user.token.picture ?? null,
  };
}

export function applyAttempt(
  profile: ProfileState,
  attempt: AttemptSummary,
): Pick<ProfileState, 'stats' | 'progress' | 'recentAttempts'> {
  const stats: OverallStats = {
    completedExams: profile.stats.completedExams + 1,
    totalQuestions: profile.stats.totalQuestions + attempt.totalQuestions,
    correctAnswers: profile.stats.correctAnswers + attempt.score,
    averagePercentage: averagePercentage(
      profile.stats.correctAnswers + attempt.score,
      profile.stats.totalQuestions + attempt.totalQuestions,
    ),
    lastAttemptAt: attempt.completedAt,
  };

  const current = profile.progress[attempt.subject] ?? emptySubjectProgress();
  const subject: SubjectProgress = {
    attempts: current.attempts + 1,
    correctAnswers: current.correctAnswers + attempt.score,
    totalQuestions: current.totalQuestions + attempt.totalQuestions,
    averagePercentage: averagePercentage(
      current.correctAnswers + attempt.score,
      current.totalQuestions + attempt.totalQuestions,
    ),
    lastAttemptAt: attempt.completedAt,
  };

  return {
    stats,
    progress: {
      ...profile.progress,
      [attempt.subject]: subject,
    },
    recentAttempts: [attempt, ...profile.recentAttempts].slice(0, 10),
  };
}
