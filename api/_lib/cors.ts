import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getEnv } from './env';

function headerValue(
  req: VercelRequest,
  name: string,
): string | undefined {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
}

export interface CorsResult {
  handled: boolean;
  originAllowed: boolean;
}

export function applyCors(
  req: VercelRequest,
  res: VercelResponse,
  requestId: string,
): CorsResult {
  const origin = headerValue(req, 'origin');
  const originAllowed =
    !origin || getEnv().allowedOrigins.includes(origin);

  if (origin && originAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Authorization, Content-Type, X-Firebase-AppCheck, X-Request-Id',
    );
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET, POST, PATCH, DELETE, OPTIONS',
    );
    res.setHeader('Access-Control-Max-Age', '600');
  }

  if (req.method === 'OPTIONS') {
    if (!originAllowed) {
      res.status(403).json({
        error: {
          code: 'CORS_DENIED',
          message: 'Origin is not allowed.',
          requestId,
        },
      });
      return { handled: true, originAllowed };
    }

    res.status(204).end();
    return { handled: true, originAllowed };
  }

  return { handled: false, originAllowed };
}
