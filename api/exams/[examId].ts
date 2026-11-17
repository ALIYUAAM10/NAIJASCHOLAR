import { z } from 'zod';
import { ApiError } from '../_lib/errors.js';
import {
  parseExam,
  toPublicExam,
  toPublicQuestion,
} from '../_lib/exams.js';
import { getDb } from '../_lib/firebase-admin.js';
import { withApi } from '../_lib/handler.js';

const querySchema = z.object({
  examId: z.string().min(1).max(100),
});

export default withApi(
  async ({ res, query }) => {
    const snapshot = await getDb()
      .collection('exams')
      .doc(query.examId)
      .get();

    if (!snapshot.exists) {
      throw new ApiError(404, 'NOT_FOUND', 'Exam not found.');
    }

    const exam = parseExam(snapshot.id, snapshot.data());
    if (!exam.published) {
      throw new ApiError(404, 'NOT_FOUND', 'Exam not found.');
    }

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=86400',
    );
    res.status(200).json({
      exam: toPublicExam(snapshot.id, exam),
      questions: exam.questions.map(toPublicQuestion),
    });
  },
  {
    methods: ['GET'],
    query: querySchema,
  },
);
