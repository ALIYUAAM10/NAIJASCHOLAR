import { ZodError } from 'zod';

export type ErrorCode =
  | 'UNAUTHENTICATED'
  | 'TOKEN_EXPIRED'
  | 'APP_CHECK_FAILED'
  | 'FORBIDDEN'
  | 'CORS_DENIED'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL';

export interface ErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    details?: unknown;
    requestId: string;
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function validationDetails(error: ZodError): unknown {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}

export function toErrorBody(
  error: unknown,
  requestId: string,
): { status: number; body: ErrorBody } {
  if (error instanceof ApiError) {
    const body: ErrorBody = {
      error: {
        code: error.code,
        message: error.message,
        requestId,
      },
    };
    if (error.details !== undefined) {
      body.error.details = error.details;
    }
    return { status: error.status, body };
  }

  if (error instanceof ZodError) {
    return {
      status: 400,
      body: {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request.',
          details: validationDetails(error),
          requestId,
        },
      },
    };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const message =
    !isProduction && error instanceof Error
      ? error.message
      : 'Internal server error.';

  return {
    status: 500,
    body: {
      error: {
        code: 'INTERNAL',
        message,
        requestId,
      },
    },
  };
}
