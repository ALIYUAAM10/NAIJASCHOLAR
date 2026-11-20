import type { VercelRequest, VercelResponse } from '@vercel/node';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('../../api/_lib/auth', () => ({
  requireUser: vi.fn(async () => ({
    uid: 'integration-user',
    email: 'student@example.com',
    emailVerified: true,
    token: { name: 'Test Student' },
  })),
}));

import exams from '../../api/exams';
import examDetail from '../../api/exams/[examId]';
import attempts from '../../api/attempts';
import me from '../../api/me';
import startSession from '../../api/mock-sessions';
import submitSession from '../../api/mock-sessions/[sessionId]/submit';
import progress from '../../api/progress';
import { getDb } from '../../api/_lib/firebase-admin';
import { sampleExams } from '../../scripts/sample-content';

interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  setHeader(name: string, value: string): void;
  status(code: number): MockResponse;
  json(payload: unknown): MockResponse;
  end(): MockResponse;
}

function createResponse(): MockResponse {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}

function request(
  method: string,
  options: { body?: unknown; query?: Record<string, string> } = {},
): VercelRequest {
  return {
    method,
    headers: { authorization: 'Bearer integration-token' },
    query: options.query ?? {},
    body: options.body,
    url: '/api/test',
  } as unknown as VercelRequest;
}

const exam = sampleExams[0];
const englishExam = sampleExams[1];
const examId = 'integration-sample-math';
const englishExamId = 'integration-sample-english';
const sessionId = 'integration-session-1';

if (!exam || !englishExam) {
  throw new Error('Sample content is required for integration tests.');
}

function examContent(source: (typeof sampleExams)[number]): Record<string, unknown> {
  const content: Record<string, unknown> = { ...source };
  delete content.id;
  return content;
}

async function clearUser(): Promise<void> {
  const db = getDb();
  const sessions = await db
    .collection('users')
    .doc('integration-user')
    .collection('mockSessions')
    .get();

  await Promise.all(sessions.docs.map((doc) => doc.ref.delete()));
  await db.collection('users').doc('integration-user').delete();
}

beforeAll(async () => {
  const db = getDb();
  await db.collection('exams').doc(examId).set(examContent(exam));
  await db.collection('exams').doc(englishExamId).set(examContent(englishExam));
  await clearUser();
});

afterAll(async () => {
  const db = getDb();
  await db.collection('exams').doc(examId).delete();
  await db.collection('exams').doc(englishExamId).delete();
  await clearUser();
});

describe('exam engine happy path', () => {
  it('creates a profile lazily and lists published exams', async () => {
    const meResponse = createResponse();
    await me(request('GET'), meResponse as unknown as VercelResponse);

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.body).toMatchObject({
      user: {
        uid: 'integration-user',
        username: 'Test Student',
        stats: { completedExams: 0 },
      },
    });

    const examsResponse = createResponse();
    await exams(request('GET'), examsResponse as unknown as VercelResponse);

    expect(examsResponse.statusCode).toBe(200);
    const listed = examsResponse.body as {
      items: Array<{ id: string }>;
      nextCursor: string | null;
    };
    expect(listed.items.some((item) => item.id === examId)).toBe(true);
    expect(listed.nextCursor).toBeNull();

    const pageOneResponse = createResponse();
    await exams(
      request('GET', { query: { limit: '1' } }),
      pageOneResponse as unknown as VercelResponse,
    );
    const pageOne = pageOneResponse.body as {
      items: Array<{ id: string }>;
      nextCursor: string | null;
    };
    expect(pageOne.items).toHaveLength(1);
    expect(pageOne.nextCursor).toBeTruthy();

    const pageTwoResponse = createResponse();
    await exams(
      request('GET', {
        query: { limit: '1', cursor: pageOne.nextCursor ?? '' },
      }),
      pageTwoResponse as unknown as VercelResponse,
    );
    const pageTwo = pageTwoResponse.body as {
      items: Array<{ id: string }>;
    };
    expect(pageTwo.items).toHaveLength(1);
    expect(pageTwo.items[0]?.id).not.toBe(pageOne.items[0]?.id);

    const detailResponse = createResponse();
    await examDetail(
      request('GET', { query: { examId } }),
      detailResponse as unknown as VercelResponse,
    );

    expect(detailResponse.statusCode).toBe(200);
    expect(detailResponse.body).toMatchObject({
      exam: { id: examId, questionCount: exam.questions.length },
    });
    expect(
      (detailResponse.body as { questions: Array<Record<string, unknown>> })
        .questions[0],
    ).not.toHaveProperty('correctOption');
  });

  it('starts an idempotent session, scores it, and updates progress once', async () => {
    const startResponse = createResponse();
    await startSession(
      request('POST', {
        body: { examId, sessionId },
      }),
      startResponse as unknown as VercelResponse,
    );

    expect(startResponse.statusCode).toBe(201);
    expect(startResponse.body).toMatchObject({
      session: {
        id: sessionId,
        examId,
        status: 'in_progress',
      },
      exam: { id: examId },
    });
    expect(
      (startResponse.body as { questions: Array<Record<string, unknown>> })
        .questions[0],
    ).not.toHaveProperty('correctOption');

    const repeatedStart = createResponse();
    await startSession(
      request('POST', {
        body: { examId, sessionId },
      }),
      repeatedStart as unknown as VercelResponse,
    );
    expect(repeatedStart.statusCode).toBe(200);

    const submitResponse = createResponse();
    await submitSession(
      request('POST', {
        query: { sessionId },
        body: {
          answers: {
            [exam.questions[0]?.id ?? 'missing']:
              exam.questions[0]?.correctOption ?? 'missing',
            [exam.questions[1]?.id ?? 'missing']: 'wrong-answer',
          },
        },
      }),
      submitResponse as unknown as VercelResponse,
    );

    expect(submitResponse.statusCode).toBe(200);
    expect(submitResponse.body).toMatchObject({
      sessionId,
      examId,
      score: 1,
      totalQuestions: exam.questions.length,
      idempotent: false,
    });

    const repeatSubmit = createResponse();
    await submitSession(
      request('POST', {
        query: { sessionId },
        body: { answers: {} },
      }),
      repeatSubmit as unknown as VercelResponse,
    );

    expect(repeatSubmit.statusCode).toBe(200);
    expect(repeatSubmit.body).toMatchObject({
      score: 1,
      idempotent: true,
    });

    const meResponse = createResponse();
    await me(request('GET'), meResponse as unknown as VercelResponse);
    expect(meResponse.body).toMatchObject({
      user: {
        stats: {
          completedExams: 1,
          totalQuestions: exam.questions.length,
          correctAnswers: 1,
        },
        progress: {
          Mathematics: { attempts: 1, correctAnswers: 1 },
        },
      },
    });
    expect(
      (meResponse.body as { user: { recentAttempts: unknown[] } }).user
        .recentAttempts,
    ).toHaveLength(1);

    const attemptsResponse = createResponse();
    await attempts(
      request('GET', { query: { limit: '5' } }),
      attemptsResponse as unknown as VercelResponse,
    );
    expect(attemptsResponse.statusCode).toBe(200);
    expect(attemptsResponse.body).toMatchObject({
      items: [{ id: sessionId, examId, score: 1 }],
      nextCursor: null,
    });

    const progressResponse = createResponse();
    await progress(
      request('GET'),
      progressResponse as unknown as VercelResponse,
    );
    expect(progressResponse.statusCode).toBe(200);
    expect(progressResponse.body).toMatchObject({
      subjects: [{ subject: 'Mathematics', attempts: 1 }],
    });
  });
});
