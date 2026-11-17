import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ZodType } from 'zod';
import { applyCors } from './cors';
import { requireAppCheck } from './appcheck';
import { requireUser, type AuthUser } from './auth';
import { ApiError, toErrorBody } from './errors';
import { hashUid, log } from './logger';
import { getRequestId } from './request-id';

export interface ApiContext<TBody = unknown, TQuery = unknown> {
  req: VercelRequest;
  res: VercelResponse;
  requestId: string;
  body: TBody;
  query: TQuery;
  user: AuthUser | undefined;
}

export interface ApiOptions<TBody = unknown, TQuery = unknown> {
  methods?: readonly string[];
  auth?: boolean;
  appCheck?: boolean;
  body?: ZodType<TBody>;
  query?: ZodType<TQuery>;
  checkRevoked?: boolean;
}

export type ApiHandler<TBody = unknown, TQuery = unknown> = (
  context: ApiContext<TBody, TQuery>,
) => Promise<void> | void;

export function withApi<TBody = unknown, TQuery = unknown>(
  handler: ApiHandler<TBody, TQuery>,
  options: ApiOptions<TBody, TQuery> = {},
) {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    const requestId = getRequestId(req);
    const startedAt = Date.now();
    res.setHeader('x-request-id', requestId);

    try {
      const cors = applyCors(req, res, requestId);
      if (cors.handled) return;

      const method = req.method ?? 'GET';

      if (
        !cors.originAllowed &&
        method !== 'GET' &&
        method !== 'HEAD'
      ) {
        throw new ApiError(
          403,
          'CORS_DENIED',
          'Origin is not allowed.',
        );
      }

      if (options.methods && !options.methods.includes(method)) {
        res.setHeader('Allow', options.methods.join(', '));
        throw new ApiError(
          405,
          'METHOD_NOT_ALLOWED',
          `Method ${method} is not allowed.`,
        );
      }

      if (options.appCheck) {
        await requireAppCheck(req);
      }

      const user = options.auth
        ? await requireUser(req, {
            checkRevoked: options.checkRevoked ?? false,
          })
        : undefined;

      if (options.auth) {
        res.setHeader('Cache-Control', 'no-store');
      }

      const body = options.body
        ? options.body.parse(req.body)
        : (req.body as TBody);

      const query = options.query
        ? options.query.parse(req.query)
        : (req.query as TQuery);

      await handler({ req, res, requestId, body, query, user });

      log('info', 'api_request', {
        requestId,
        method,
        path: req.url,
        status: res.statusCode,
        ms: Date.now() - startedAt,
        uid: user ? hashUid(user.uid) : undefined,
      });
    } catch (error) {
      const { status, body } = toErrorBody(error, requestId);

      log('error', 'api_error', {
        requestId,
        method: req.method,
        path: req.url,
        status,
        code: body.error.code,
        ms: Date.now() - startedAt,
      });

      if (!res.headersSent) {
        res.status(status).json(body);
      }
    }
  };
}
