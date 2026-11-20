import { FieldPath } from 'firebase-admin/firestore';
import { z } from 'zod';
import { ApiError } from '../_lib/errors.js';
import { parseExam, toPublicExam } from '../_lib/exams.js';
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

function examCursor(
  cursor: CursorKey[] | undefined,
): [string, string, string] | undefined {
  if (!cursor) return undefined;

  const [subject, title, id] = cursor;
  if (
    typeof subject !== 'string' ||
    typeof title !== 'string' ||
    typeof id !== 'string'
  ) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid exam cursor.');
  }

  return [subject, title, id];
}

export default withApi(
  async ({ res, query }) => {
    const limit = parseLimit(query.limit);
    const cursor = examCursor(decodeCursor(query.cursor));

    let request = getDb()
      .collection('exams')
      .where('published', '==', true)
      .orderBy('subject')
      .orderBy('title')
      .orderBy(FieldPath.documentId())
      .limit(limit + 1);

    if (cursor) {
      request = request.startAfter(...cursor);
    }

    const snapshot = await request.get();
    const docs = snapshot.docs.slice(0, limit);
    const items = docs.map((doc) => {
      const exam = parseExam(doc.id, doc.data());
      return toPublicExam(doc.id, exam);
    });

    const last = docs[docs.length - 1];
    const nextCursor =
      snapshot.docs.length > limit && last
        ? encodeCursor([
            last.get('subject') as string,
            last.get('title') as string,
            last.id,
          ])
        : null;

    res.setHeader(
      'Cache-Control',
      'public, s-maxage=300, stale-while-revalidate=86400',
    );
    res.status(200).json({ items, nextCursor });
  },
  {
    methods: ['GET'],
    query: querySchema,
  },
);
