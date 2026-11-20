import type { ScoreResult } from './scoring.js';

export interface SessionResponse {
  id: string;
  examId: string;
  status: 'in_progress' | 'completed';
  startedAt: string;
  expiresAt: string;
  completedAt: string | null;
}

export interface StoredResult extends ScoreResult {
  sessionId: string;
  examId: string;
  examTitle: string;
  subject: string;
  completedAt: string;
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

export function sessionResponse(
  id: string,
  data: Record<string, unknown>,
): SessionResponse {
  const startedAtMs = asNumber(data.startedAtMs, Date.now());
  const expiresAtMs = asNumber(
    data.expiresAtMs,
    startedAtMs + 10 * 60 * 1_000,
  );
  const completedAtMs =
    typeof data.completedAtMs === 'number' ? data.completedAtMs : null;

  return {
    id,
    examId: asString(data.examId),
    status: data.status === 'completed' ? 'completed' : 'in_progress',
    startedAt: new Date(startedAtMs).toISOString(),
    expiresAt: new Date(expiresAtMs).toISOString(),
    completedAt:
      completedAtMs === null ? null : new Date(completedAtMs).toISOString(),
  };
}

export function asStoredResult(value: unknown): StoredResult | null {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return null;
  }

  const result = value as Record<string, unknown>;
  if (
    typeof result.sessionId !== 'string' ||
    typeof result.examId !== 'string' ||
    typeof result.examTitle !== 'string' ||
    typeof result.subject !== 'string' ||
    typeof result.completedAt !== 'string' ||
    typeof result.score !== 'number' ||
    typeof result.totalQuestions !== 'number' ||
    typeof result.percentage !== 'number' ||
    !Array.isArray(result.review)
  ) {
    return null;
  }

  return result as unknown as StoredResult;
}

export function isAlreadyExists(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) return false;

  const candidate = error as { code?: unknown; message?: unknown };
  const code = String(candidate.code ?? '');

  return (
    code === '6' ||
    code === 'ALREADY_EXISTS' ||
    (typeof candidate.message === 'string' &&
      /already exists/i.test(candidate.message))
  );
}
