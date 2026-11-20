import { z } from 'zod';
import { ApiError } from './errors.js';

export type CursorKey = string | number;

const cursorSchema = z.object({
  v: z.literal(1),
  k: z.array(z.union([z.string(), z.number()])).min(1).max(4),
});

export function encodeCursor(key: CursorKey[]): string {
  return Buffer.from(JSON.stringify({ v: 1, k: key }), 'utf8').toString(
    'base64url',
  );
}

export function decodeCursor(
  cursor: string | undefined,
): CursorKey[] | undefined {
  if (!cursor) return undefined;

  try {
    const json = Buffer.from(cursor, 'base64url').toString('utf8');
    const parsed = cursorSchema.safeParse(JSON.parse(json));
    if (!parsed.success) {
      throw new Error('Invalid cursor shape.');
    }
    return parsed.data.k;
  } catch {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Invalid cursor.');
  }
}

export function parseLimit(
  raw: unknown,
  options: { defaultLimit?: number; max?: number } = {},
): number {
  const defaultLimit = options.defaultLimit ?? 20;
  const max = options.max ?? 50;
  const value = Array.isArray(raw) ? raw[0] : raw;

  if (value === undefined || value === '') return defaultLimit;

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > max) {
    throw new ApiError(
      400,
      'VALIDATION_ERROR',
      `limit must be an integer between 1 and ${max}.`,
    );
  }

  return parsed;
}
