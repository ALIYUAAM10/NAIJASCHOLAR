import type { VercelRequest } from '@vercel/node';
import { getAppCheck } from 'firebase-admin/app-check';
import { getEnv } from './env.js';
import { getFirebaseApp } from './firebase-admin.js';
import { ApiError } from './errors.js';

export async function requireAppCheck(req: VercelRequest): Promise<void> {
  const env = getEnv();

  if (!env.appCheckEnforce || env.isEmulator) return;

  const header = req.headers['x-firebase-appcheck'];
  const token = Array.isArray(header) ? header[0] : header;

  if (!token) {
    throw new ApiError(
      401,
      'APP_CHECK_FAILED',
      'Missing Firebase App Check token.',
    );
  }

  try {
    await getAppCheck(getFirebaseApp()).verifyToken(token);
  } catch {
    throw new ApiError(
      401,
      'APP_CHECK_FAILED',
      'Invalid Firebase App Check token.',
    );
  }
}
