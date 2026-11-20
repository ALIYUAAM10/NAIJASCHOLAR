import { createHash } from 'node:crypto';
import { getEnv } from './env.js';

type LogLevel = 'info' | 'warn' | 'error';

export function hashUid(uid: string): string {
  return createHash('sha256')
    .update(`${getEnv().logHashSalt}:${uid}`)
    .digest('hex')
    .slice(0, 12);
}

export function log(
  level: LogLevel,
  event: string,
  fields: Record<string, unknown> = {},
): void {
  const line = JSON.stringify({
    level,
    event,
    ts: new Date().toISOString(),
    ...fields,
  });

  if (level === 'error') {
    console.error(line);
    return;
  }

  if (level === 'warn') {
    console.warn(line);
    return;
  }

  console.log(line);
}
