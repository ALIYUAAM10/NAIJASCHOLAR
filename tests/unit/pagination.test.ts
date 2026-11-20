import { describe, expect, it } from 'vitest';
import {
  decodeCursor,
  encodeCursor,
  parseLimit,
} from '../../api/_lib/pagination';

describe('cursor pagination', () => {
  it('round-trips string and number cursor keys', () => {
    const cursor = encodeCursor(['2026-01-01T00:00:00.000Z', 42]);
    expect(decodeCursor(cursor)).toEqual(['2026-01-01T00:00:00.000Z', 42]);
  });

  it('treats an empty cursor as the first page', () => {
    expect(decodeCursor(undefined)).toBeUndefined();
    expect(decodeCursor('')).toBeUndefined();
  });

  it('rejects tampered cursors', () => {
    expect(() => decodeCursor('not-a-cursor')).toThrowError('Invalid cursor.');
  });

  it('uses a safe default and enforces the maximum limit', () => {
    expect(parseLimit(undefined)).toBe(20);
    expect(parseLimit('10')).toBe(10);

    expect(() => parseLimit('0')).toThrowError(/limit must be/);
    expect(() => parseLimit('100', { max: 50 })).toThrowError(/limit must be/);
  });
});
