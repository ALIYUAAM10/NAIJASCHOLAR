import { randomUUID } from 'node:crypto';

const SAFE_REQUEST_ID = /^[A-Za-z0-9_-]{8,64}$/;

export function getRequestId(req: {
  headers: Record<string, string | string[] | undefined>;
}): string {
  const header = req.headers['x-request-id'];
  const value = Array.isArray(header) ? header[0] : header;

  if (value && SAFE_REQUEST_ID.test(value)) {
    return value;
  }

  return randomUUID();
}
