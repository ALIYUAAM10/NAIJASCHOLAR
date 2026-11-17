import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { ApiError, toErrorBody } from '../../api/_lib/errors';

describe('toErrorBody', () => {
  it('serializes ApiError with a stable envelope', () => {
    const result = toErrorBody(
      new ApiError(409, 'CONFLICT', 'Already submitted.', {
        submissionId: 'abc',
      }),
      'req-1',
    );

    expect(result).toEqual({
      status: 409,
      body: {
        error: {
          code: 'CONFLICT',
          message: 'Already submitted.',
          details: { submissionId: 'abc' },
          requestId: 'req-1',
        },
      },
    });
  });

  it('serializes Zod validation errors without leaking internals', () => {
    const schema = z.object({ email: z.string().email() });
    const parsed = schema.safeParse({ email: 'not-an-email' });

    if (parsed.success) throw new Error('Expected validation to fail.');

    const result = toErrorBody(parsed.error, 'req-2');

    expect(result.status).toBe(400);
    expect(result.body.error.code).toBe('VALIDATION_ERROR');
    expect(result.body.error.message).toBe('Invalid request.');
    expect(Array.isArray(result.body.error.details)).toBe(true);
  });

  it('uses a generic message for unknown errors in production', () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    try {
      const result = toErrorBody(new Error('database password leaked'), 'req-3');
      expect(result.status).toBe(500);
      expect(result.body.error.code).toBe('INTERNAL');
      expect(result.body.error.message).toBe('Internal server error.');
    } finally {
      if (previous === undefined) {
        delete process.env.NODE_ENV;
      } else {
        process.env.NODE_ENV = previous;
      }
    }
  });
});
