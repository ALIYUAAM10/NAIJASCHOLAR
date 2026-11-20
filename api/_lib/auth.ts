import type { VercelRequest } from '@vercel/node';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { getAdminAuth } from './firebase-admin.js';
import { ApiError } from './errors.js';

export interface AuthUser {
  uid: string;
  email: string | undefined;
  emailVerified: boolean;
  token: DecodedIdToken;
}

export interface RequireUserOptions {
  checkRevoked?: boolean;
}

export async function requireUser(
  req: VercelRequest,
  options: RequireUserOptions = {},
): Promise<AuthUser> {
  const header = req.headers.authorization;
  const raw = Array.isArray(header) ? header[0] : header;

  if (!raw) {
    throw new ApiError(
      401,
      'UNAUTHENTICATED',
      'Missing Authorization header.',
    );
  }

  const match = /^Bearer\s+(.+)$/i.exec(raw);
  const token = match?.[1]?.trim();

  if (!token) {
    throw new ApiError(
      401,
      'UNAUTHENTICATED',
      'Authorization header must use the Bearer scheme.',
    );
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(
      token,
      options.checkRevoked ?? false,
    );

    return {
      uid: decoded.uid,
      email: decoded.email,
      emailVerified: decoded.email_verified ?? false,
      token: decoded,
    };
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? String(error.code)
        : '';

    if (code === 'auth/id-token-expired') {
      throw new ApiError(401, 'TOKEN_EXPIRED', 'ID token has expired.');
    }

    if (code === 'auth/id-token-revoked') {
      throw new ApiError(401, 'UNAUTHENTICATED', 'ID token has been revoked.');
    }

    throw new ApiError(401, 'UNAUTHENTICATED', 'Invalid ID token.');
  }
}
