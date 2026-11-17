import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';
import { ApiError } from '../_lib/errors';
import {
  parseExam,
  toPublicExam,
  toPublicQuestion,
} from '../_lib/exams';
import { getDb } from '../_lib/firebase-admin';
import { withApi } from '../_lib/handler';
import {
  isAlreadyExists,
  sessionResponse,
} from '../_lib/mock-sessions';

const bodySchema = z.object({
  examId: z.string().min(1).max(100),
  sessionId: z
    .string()
    .regex(
      /^[A-Za-z0-9_-]{8,64}$/,
      'sessionId must be 8-64 URL-safe characters.',
    ),
});

export default withApi(
  async ({ res, body, user }) => {
    if (!user) {
      throw new Error('Authenticated request reached handler without a user.');
    }

    const db = getDb();
    const sessionRef = db
      .collection('users')
      .doc(user.uid)
      .collection('mockSessions')
      .doc(body.sessionId);
    const examRef = db.collection('exams').doc(body.examId);

    const [existingSession, examSnapshot] = await Promise.all([
      sessionRef.get(),
      examRef.get(),
    ]);

    if (!examSnapshot.exists) {
      throw new ApiError(404, 'NOT_FOUND', 'Exam not found.');
    }

    const exam = parseExam(examSnapshot.id, examSnapshot.data());
    if (!exam.published) {
      throw new ApiError(404, 'NOT_FOUND', 'Exam not found.');
    }

    if (existingSession.exists) {
      const data = existingSession.data() ?? {};
      if (data.examId !== examSnapshot.id) {
        throw new ApiError(
          409,
          'CONFLICT',
          'This session ID is already used for another exam.',
        );
      }

      if (data.status === 'completed') {
        throw new ApiError(
          409,
          'CONFLICT',
          'This mock session is already completed.',
        );
      }

      res.status(200).json({
        session: sessionResponse(existingSession.id, data),
        exam: toPublicExam(examSnapshot.id, exam),
        questions: exam.questions.map(toPublicQuestion),
      });
      return;
    }

    const now = Date.now();
    const expiresAtMs = now + exam.durationMinutes * 60 * 1_000;
    const data = {
      examId: examSnapshot.id,
      examTitle: exam.title,
      subject: exam.subject,
      status: 'in_progress' as const,
      startedAt: Timestamp.fromMillis(now),
      startedAtMs: now,
      expiresAtMs,
      totalQuestions: exam.questions.length,
      createdAt: Timestamp.fromMillis(now),
      updatedAt: Timestamp.fromMillis(now),
    };

    try {
      await sessionRef.create(data);
    } catch (error) {
      if (!isAlreadyExists(error)) throw error;

      const raced = await sessionRef.get();
      if (!raced.exists) throw error;

      const racedData = raced.data() ?? {};
      if (racedData.examId !== examSnapshot.id) {
        throw new ApiError(
          409,
          'CONFLICT',
          'This session ID is already used for another exam.',
        );
      }

      if (racedData.status === 'completed') {
        throw new ApiError(
          409,
          'CONFLICT',
          'This mock session is already completed.',
        );
      }

      res.status(200).json({
        session: sessionResponse(raced.id, racedData),
        exam: toPublicExam(examSnapshot.id, exam),
        questions: exam.questions.map(toPublicQuestion),
      });
      return;
    }

    res.status(201).json({
      session: sessionResponse(body.sessionId, data),
      exam: toPublicExam(examSnapshot.id, exam),
      questions: exam.questions.map(toPublicQuestion),
    });
  },
  {
    methods: ['POST'],
    auth: true,
    appCheck: true,
    body: bodySchema,
  },
);
