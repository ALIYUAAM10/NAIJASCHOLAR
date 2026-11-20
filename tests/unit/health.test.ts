import type { VercelRequest, VercelResponse } from '@vercel/node';
import { describe, expect, it } from 'vitest';
import health from '../../api/health';

interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
  setHeader(name: string, value: string): void;
  status(code: number): MockResponse;
  json(payload: unknown): MockResponse;
  end(): MockResponse;
}

function createResponse(): MockResponse {
  return {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}

function request(
  method: string,
  headers: Record<string, string> = {},
): VercelRequest {
  return {
    method,
    headers,
    url: '/api/health',
    body: undefined,
  } as unknown as VercelRequest;
}

describe('GET /api/health', () => {
  it('returns ok and echoes a valid request id', async () => {
    const res = createResponse();

    await health(
      request('GET', { 'x-request-id': 'test-request-123' }),
      res as unknown as VercelResponse,
    );

    expect(res.statusCode).toBe(200);
    expect(res.headers['x-request-id']).toBe('test-request-123');
    expect(res.body).toEqual({
      status: 'ok',
      requestId: 'test-request-123',
    });
  });

  it('rejects unsupported methods with the standard error envelope', async () => {
    const res = createResponse();

    await health(
      request('POST', { 'x-request-id': 'test-request-456' }),
      res as unknown as VercelResponse,
    );

    expect(res.statusCode).toBe(405);
    expect(res.body).toMatchObject({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        requestId: 'test-request-456',
      },
    });
  });

  it('rejects a disallowed write origin', async () => {
    const res = createResponse();

    await health(
      request('POST', { origin: 'https://evil.example' }),
      res as unknown as VercelResponse,
    );

    expect(res.statusCode).toBe(403);
    expect(res.body).toMatchObject({
      error: {
        code: 'CORS_DENIED',
      },
    });
  });
});
