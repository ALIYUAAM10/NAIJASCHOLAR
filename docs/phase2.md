# Phase 2: Firestore exam engine and Firebase Auth cutover

Phase 2 replaces the legacy Express/PostgreSQL/JWT runtime with Vercel Functions
and Firebase. It is the first user-facing cutover; Phase 1 only added a parallel
foundation.

## Backend libraries

- `api/_lib/exams.ts` — Zod exam schema, content validation, public mappers that
  strip `correctOption` and `explanation`.
- `api/_lib/scoring.ts` — pure server-side scoring, percentage calculation and
  review generation.
- `api/_lib/profile.ts` — default/normalized profiles, overall stats,
  per-subject progress, latest ten attempts and attempt merging.
- `api/_lib/mock-sessions.ts` — session response mapping, stored-result guards
  and `ALREADY_EXISTS` detection.

## Endpoints

| Route | Behaviour |
| --- | --- |
| `GET /api/health` | Liveness check with request ID. |
| `GET /api/exams` | Published exams, cursor paginated, CDN cached for 5 minutes. |
| `GET /api/exams/:examId` | Public exam metadata and question bank. |
| `POST /api/mock-sessions` | Idempotent start/resume using a client-generated ID; returns `{ session, exam, questions }`. |
| `POST /api/mock-sessions/:sessionId/submit` | Atomic score/session/profile update; returns result fields plus `idempotent`. |
| `GET /api/attempts` | Completed attempts, cursor paginated by completed time and ID. |
| `GET /api/progress` | Overall stats and per-subject progress from one profile document. |
| `GET/PATCH /api/me` | Flat profile response; PATCH allows username and leaderboard opt-in. |

Protected routes verify the Firebase ID token with the Admin SDK. CORS, App
Check hooks, request IDs, structured logs and the JSON error envelope come from
`withApi`.

## Frontend cutover

- `frontend/src/services/firebase.js` — Google/email auth, auth subscription,
  ID-token retrieval, logout, friendly errors and optional Auth emulator.
- `frontend/src/services/api.js` — authenticated API client with one 401 token
  refresh/retry, exam/mock/profile methods and `crypto.randomUUID` fallback.
- `AuthScreen.jsx` — Google and email login/registration plus username sync.
- `App.jsx` — Firebase auth state, dashboard loading, session lifecycle and a
  guarded auto-submit on timer expiry.
- `Dashboard.jsx`, `QuizSession.jsx`, `QuizResult.jsx` — camelCase API fields,
  array options, `q.text`, submit lock and static post-submit explanations.
- `ErrorBoundary.jsx` — signs out of Firebase before reloading.

## Content and indexes

- `scripts/sample-content.ts` contains two sample exams with five questions and
  static explanations each. Every exam is marked `sample: true`.
- `scripts/seed.ts` writes idempotently to `exams/{examId}`; `npm run seed` uses
  server credentials and `npm run seed:emulator` uses `demo-naijaprep`.
- `firestore.indexes.json` covers the exam list and attempt-history composite
  queries, including explicit `__name__` ordering.

## Removed legacy code

`backend/`, `database/`, `render.yaml`, `RENDER_DEPLOYMENT.md` and
`RENDER_FIX_NOW.md` were deleted after parity checks. No runtime code imports
Express, PostgreSQL, JWT or Render variables.

## Verification runbook

```bash
npm install
npm --prefix frontend install
npm run typecheck
npm run lint
npm test                 # 27 unit tests
npm run test:rules       # 3 deny-all rules tests
npm run test:integration # 2 Firestore-backed API flow tests
npm run build            # typecheck + Vite bundle
npm run seed:emulator    # requires a running emulator
```

Expected frontend bundle: about 347 KB raw / 90 KB gzip, below the 180 KB gzip
budget. `tests/integration/exam-flow.test.ts` verifies profile creation, exam
list/detail, pagination, answer stripping, idempotent session start, atomic
submit, single-count profile updates, attempt history and progress.

## Deployment

1. Configure Firebase Auth providers and authorized domains.
2. `firebase deploy --only firestore:rules,storage,firestore:indexes`.
3. Set server variables in Vercel and public `VITE_FIREBASE_*` variables in the
   frontend build environment.
4. Deploy the Vercel project and check `/api/health`.
5. Run `npm run seed` once to load the marked sample exams.
6. Keep `APP_CHECK_ENFORCE=false` until the web App Check provider is wired up.

## Not in Phase 2

Offline bundles, service worker, IndexedDB retry queue, resume-active-session,
rate limiting, full history UI, study planner, reviewed content pipeline and
FCM are later phases. See `docs/migration.md`.
