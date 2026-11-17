import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { ApiError } from '../../_lib/errors.js';
import { parseExam } from '../../_lib/exams.js';
import { getDb } from '../../_lib/firebase-admin.js';
import { withApi } from '../../_lib/handler.js';
import {
  asStoredResult,
  type StoredResult,
} from '../../_lib/mock-sessions.js';
import {
  applyAttempt,
  defaultProfile,
  normalizeProfile,
  profileFields,
} from '../../_lib/profile.js';
import { scoreAttempt } from '../../_lib/scoring.js';

const querySchema = z.object({
  sessionId: z.string().regex(/^[A-Za-z0-9_-]{8,64}$/),
});

const answersSchema = z
  .record(z.string().min(1).max(100), z.string().max(500))
  .refine((answers) => Object.keys(answers).length <= 100, {
    message: 'Too many answers.',
  });

const bodySchema = z.object({
  answers: answersSchema,
});

export default withApi(
  async ({ res, body, query, user }) => {
    if (!user) {
      throw new Error('Authenticated request reached handler without a user.');
    }

    const db = getDb();
    const sessionRef = db
      .collection('users')
      .doc(user.uid)
      .collection('mockSessions')
      .doc(query.sessionId);
    const profileRef = db.collection('users').doc(user.uid);
    const completedAtMs = Date.now();

    const response = await db.runTransaction(async (transaction) => {
      const sessionSnapshot = await transaction.get(sessionRef);
      if (!sessionSnapshot.exists) {
        throw new ApiError(404, 'NOT_FOUND', 'Mock session not found.');
      }

      const session = sessionSnapshot.data() ?? {};

      if (session.status === 'completed') {
        const stored = asStoredResult(session.result);
        if (!stored) {
          throw new ApiError(
            500,
            'INTERNAL',
            'Completed session is missing its result.',
          );
        }
        return { result: stored, idempotent: true };
      }

      const examId =
        typeof session.examId === 'string' ? session.examId : '';
      if (!examId) {
        throw new ApiError(500, 'INTERNAL', 'Session is missing its exam.');
      }

      const examSnapshot = await transaction.get(
        db.collection('exams').doc(examId),
      );
      if (!examSnapshot.exists) {
        throw new ApiError(404, 'NOT_FOUND', 'Exam not found.');
      }

      const exam = parseExam(examSnapshot.id, examSnapshot.data());
      const scored = scoreAttempt(exam.questions, body.answers);
      const completedAt = new Date(completedAtMs).toISOString();
      const result: StoredResult = {
        sessionId: query.sessionId,
        examId,
        examTitle: exam.title,
        subject: exam.subject,
        ...scored,
        completedAt,
      };

      const profileSnapshot = await transaction.get(profileRef);
      const profile = profileSnapshot.exists
        ? normalizeProfile(profileSnapshot.data() ?? {}, user)
        : defaultProfile(user);
      const updates = applyAttempt(profile, {
        id: query.sessionId,
        examId,
        title: exam.title,
        subject: exam.subject,
        score: scored.score,
        totalQuestions: scored.totalQuestions,
        percentage: scored.percentage,
        completedAt,
      });

      const now = Timestamp.fromMillis(completedAtMs);

      transaction.update(sessionRef, {
        status: 'completed',
        score: scored.score,
        totalQuestions: scored.totalQuestions,
        percentage: scored.percentage,
        review: scored.review,
        result,
        completedAt: now,
        completedAtMs,
        updatedAt: now,
      });

      if (profileSnapshot.exists) {
        transaction.set(
          profileRef,
          {
            ...updates,
            updatedAt: now,
          },
          { merge: true },
        );
      } else {
        transaction.set(profileRef, {
          ...profileFields(profile),
          ...updates,
          createdAt: now,
          updatedAt: now,
        });
      }

      return { result, idempotent: false };
    });

    res.status(200).json({
      ...response.result,
      idempotent: response.idempotent,
    });
  },
  {
    methods: ['POST'],
    auth: true,
    appCheck: true,
    body: bodySchema,
    query: querySchema,
  },
);
