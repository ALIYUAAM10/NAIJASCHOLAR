import { FieldPath } from 'firebase-admin/firestore';
import { z } from 'zod';
import { ApiError } from '../_lib/errors.js';
import { getDb } from '../_lib/firebase-admin.js';
import { withApi } from '../_lib/handler.js';
import {
  decodeCursor,
  encodeCursor,
  parseLimit,
  type CursorKey,
} from '../_lib/pagination.js';

const querySchema = z.object({
  limit: z.string().optional(),
  cursor: z.string().optional(),
});

function attemptsCursor(
  cursor: CursorKey[] | undefined,
): [number, string] | undefined {
  if (!cursor) return undefined;

  const [completedAtMs, id] = cursor;
  if (typeof completedAtMs !== 'number' || typeof id !== 'string') {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid attempts cursor.');
  }

  return [completedAtMs, id];
}

export default withApi(
  async ({ res, query, user }) => {
    if (!user) {
      throw new Error('Authenticated request reached handler without a user.');
    }

    const limit = parseLimit(query.limit);
    const cursor = attemptsCursor(decodeCursor(query.cursor));

    let request = getDb()
      .collection('users')
      .doc(user.uid)
      .collection('mockSessions')
      .where('status', '==', 'completed')
      .orderBy('completedAtMs', 'desc')
      .orderBy(FieldPath.documentId(), 'desc')
      .limit(limit + 1);

    if (cursor) {
      request = request.startAfter(...cursor);
    }

    const snapshot = await request.get();
    const docs = snapshot.docs.slice(0, limit);
    const items = docs.map((doc) => {
      const data = doc.data();
      const completedAtMs =
        typeof data.completedAtMs === 'number' ? data.completedAtMs : 0;

      return {
        id: doc.id,
        examId: typeof data.examId === 'string' ? data.examId : '',
        title: typeof data.examTitle === 'string' ? data.examTitle : '',
        subject: typeof data.subject === 'string' ? data.subject : '',
        score: typeof data.score === 'number' ? data.score : 0,
        totalQuestions:
          typeof data.totalQuestions === 'number' ? data.totalQuestions : 0,
        percentage:
          typeof data.percentage === 'number' ? data.percentage : 0,
        completedAt:
          completedAtMs > 0
            ? new Date(completedAtMs).toISOString()
            : new Date(0).toISOString(),
      };
    });

    const last = docs[docs.length - 1];
    const nextCursor =
      snapshot.docs.length > limit && last
        ? encodeCursor([
            typeof last.get('completedAtMs') === 'number'
              ? (last.get('completedAtMs') as number)
              : 0,
            last.id,
          ])
        : null;

    res.status(200).json({ items, nextCursor });
  },
  {
    methods: ['GET'],
    auth: true,
    appCheck: true,
    query: querySchema,
  },
);
