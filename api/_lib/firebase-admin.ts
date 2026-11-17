import { cert, getApps, initializeApp, type App, type AppOptions } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getEnv } from './env';

let app: App | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;

export function getFirebaseApp(): App {
  if (app) return app;

  const existing = getApps();
  const first = existing[0];
  if (first) {
    app = first;
    return app;
  }

  const env = getEnv();

  if (env.isEmulator) {
    app = initializeApp({ projectId: env.projectId });
    return app;
  }

  const { clientEmail, privateKey } = env;

  if (!clientEmail || !privateKey) {
    throw new Error('Firebase service account credentials are missing.');
  }

  const options: AppOptions = {
    projectId: env.projectId,
    credential: cert({
      projectId: env.projectId,
      clientEmail,
      privateKey,
    }),
  };

  if (env.storageBucket) {
    options.storageBucket = env.storageBucket;
  }

  app = initializeApp(options);

  return app;
}

export function getAdminAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
    db.settings({ ignoreUndefinedProperties: true });
  }
  return db;
}
