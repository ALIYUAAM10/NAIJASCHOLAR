import { z } from 'zod';

const rawEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
  FIREBASE_STORAGE_BUCKET: z.string().min(1).optional(),
  FIREBASE_AUTH_EMULATOR_HOST: z.string().min(1).optional(),
  FIRESTORE_EMULATOR_HOST: z.string().min(1).optional(),
  FIREBASE_STORAGE_EMULATOR_HOST: z.string().min(1).optional(),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173'),
  APP_CHECK_ENFORCE: z.enum(['true', 'false']).default('false'),
  LOG_HASH_SALT: z.string().min(16).default('dev-only-salt-change-me'),
  CRON_SECRET: z.string().min(16).optional(),
});

export interface Env {
  projectId: string;
  clientEmail: string | undefined;
  privateKey: string | undefined;
  storageBucket: string | undefined;
  isEmulator: boolean;
  allowedOrigins: string[];
  appCheckEnforce: boolean;
  logHashSalt: string;
}

let cached: Env | undefined;

export function getEnv(): Env {
  if (cached) return cached;

  const parsed = rawEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const paths = parsed.error.issues.map((issue) => issue.path.join('.'));
    throw new Error(`Invalid environment variables: ${paths.join(', ')}`);
  }

  const raw = parsed.data;
  const isEmulator = Boolean(
    raw.FIREBASE_AUTH_EMULATOR_HOST || raw.FIRESTORE_EMULATOR_HOST,
  );

  if (
    !isEmulator &&
    (!raw.FIREBASE_CLIENT_EMAIL || !raw.FIREBASE_PRIVATE_KEY)
  ) {
    throw new Error(
      'FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are required outside the emulator.',
    );
  }

  if (
    raw.NODE_ENV === 'production' &&
    raw.LOG_HASH_SALT === 'dev-only-salt-change-me'
  ) {
    throw new Error('LOG_HASH_SALT must be set to a random value in production.');
  }

  const allowedOrigins = raw.ALLOWED_ORIGINS.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    throw new Error('ALLOWED_ORIGINS must contain at least one origin.');
  }

  cached = {
    projectId: raw.FIREBASE_PROJECT_ID,
    clientEmail: raw.FIREBASE_CLIENT_EMAIL,
    privateKey: raw.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    storageBucket: raw.FIREBASE_STORAGE_BUCKET,
    isEmulator,
    allowedOrigins,
    appCheckEnforce: raw.APP_CHECK_ENFORCE === 'true',
    logHashSalt: raw.LOG_HASH_SALT,
  };

  return cached;
}
