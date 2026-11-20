import type { VercelRequest } from '@vercel/node';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { verifyIdToken } = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
}));

vi.mock('../../api/_lib/firebase-admin', () => ({
  getAdminAuth: () => ({ verifyIdToken }),
}));

import { requireUser } from '../../api/_lib/auth';

function request(headers: Record<string, string> = {}): VercelRequest {
  return {
    headers,
    body: { uid: 'attacker-controlled' },
    method: 'GET',
    url: '/api/me',
  } as unknown as VercelRequest;
}

describe('requireUser', () => {
  beforeEach(() => {
    verifyIdToken.mockReset();
  });

  it('rejects a missing Authorization header', async () => {
    await expect(requireUser(request())).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    });
  });

  it('rejects a malformed Authorization header', async () => {
    await expect(
      requireUser(request({ authorization: 'Token abc' })),
    ).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    });
  });

  it('returns the verified uid and ignores client-sent user ids', async () => {
    verifyIdToken.mockResolvedValue({
      uid: 'real-user',
      email: 'student@example.com',
      email_verified: true,
    });

    const user = await requireUser(
      request({ authorization: 'Bearer valid-token' }),
    );

    expect(user.uid).toBe('real-user');
    expect(user.uid).not.toBe('attacker-controlled');
    expect(user.email).toBe('student@example.com');
    expect(user.emailVerified).toBe(true);
    expect(verifyIdToken).toHaveBeenCalledWith('valid-token', false);
  });

  it('maps expired tokens to TOKEN_EXPIRED', async () => {
    verifyIdToken.mockRejectedValue({ code: 'auth/id-token-expired' });

    await expect(
      requireUser(request({ authorization: 'Bearer expired' })),
    ).rejects.toMatchObject({
      status: 401,
      code: 'TOKEN_EXPIRED',
    });
  });

  it('maps revoked tokens to UNAUTHENTICATED', async () => {
    verifyIdToken.mockRejectedValue({ code: 'auth/id-token-revoked' });

    await expect(
      requireUser(request({ authorization: 'Bearer revoked' })),
    ).rejects.toMatchObject({
      status: 401,
      code: 'UNAUTHENTICATED',
    });
  });

  it('supports revoked-token checks when requested', async () => {
    verifyIdToken.mockResolvedValue({ uid: 'real-user' });

    await requireUser(request({ authorization: 'Bearer valid-token' }), {
      checkRevoked: true,
    });

    expect(verifyIdToken).toHaveBeenCalledWith('valid-token', true);
  });
});
