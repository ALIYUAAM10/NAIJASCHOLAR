# Migration notes

The app started as React/Vite + Express/PostgreSQL/JWT. The target stack is
Vercel Functions + Firebase Auth/Firestore/Storage/FCM. The migration is being
delivered in approved phases.

## Phase 1 (completed, historical)

Added in parallel without changing the user-facing stack:

- Vercel Functions foundation in `api/_lib`.
- `GET /api/health` and authenticated `GET /api/me`.
- Firebase Admin singleton, ID-token verification, App Check hook, CORS,
  request IDs, structured logs and a consistent error envelope.
- Deny-all Firestore and Storage rules.
- Unit tests, emulator rules tests and TypeScript/Vitest/ESLint configuration.

See `docs/phase1.md` for the original verification runbook.

## Phase 2 (completed)

- Added the Firestore exam engine: parse/validate exams, strip answer keys from
  public responses, score submissions server-side, and generate static review
  explanations from Firestore content.
- Added endpoints: `GET /api/exams`, `GET /api/exams/:examId`,
  `POST /api/mock-sessions`, `POST /api/mock-sessions/:sessionId/submit`,
  `GET /api/attempts`, `GET /api/progress`, `GET/PATCH /api/me` and
  `GET /api/health`.
- Added `users/{uid}/mockSessions/{sessionId}` with client-generated IDs and
  idempotent submission. Submit uses one transaction to score, complete the
  session and update the profile.
- Denormalized overall stats, per-subject progress and the last ten attempts on
  `users/{uid}` so the dashboard needs one read.
- Moved the frontend to Firebase Auth (Google and email/password), added a
  401-refresh API client, and updated dashboard, quiz and result screens to the
  new camelCase API contract.
- Added sample exams with static explanations in `scripts/sample-content.ts` and
  an idempotent seeder (`npm run seed` / `npm run seed:emulator`). Sample exams
  are marked `sample: true`.
- Added integration tests for the full exam flow and pagination assertions.
- Deleted `backend/`, `database/`, `render.yaml`, `RENDER_DEPLOYMENT.md` and
  `RENDER_FIX_NOW.md` after parity checks.
- Updated `firestore.indexes.json` for exam-list and attempt-history queries.

See `docs/phase2.md` for verification details.

## Remaining phases

- **Phase 3:** offline-first PWA: compact per-exam/subject bundles, service
  worker caching, IndexedDB attempt queue, idempotent sync with conflict/retry
  handling and resume-active-session.
- **Phase 4:** full paginated history UI, study planner and static
  hints/study-tip content (no AI dependency).
- **Phase 5:** App Check enforcement, rate limiting, abuse monitoring and
  low-end/3G device testing.
- **Phase 6:** reviewed content pipeline and Firebase Storage/FCM features.

## Deployment order

1. Set Vercel environment variables (server-only) and `frontend/.env.local`
   client identifiers.
2. Enable Firebase Auth providers and authorized domains.
3. Deploy rules and indexes:
   `firebase deploy --only firestore:rules,storage,firestore:indexes`.
4. Deploy the Vercel project; confirm `/api/health` returns 200.
5. Run `npm run seed` once to load the clearly marked sample exams.
6. Verify sign-in, a mock start/submit, dashboard stats and attempt history.
7. Only then set `APP_CHECK_ENFORCE=true` and add the web App Check provider.

## Security follow-up

The historical Neon credential in the old `backend/.env.example` remains in git
history even though the working file and backend directory are gone. The repo
owner must rotate it and purge history. See `docs/security-incident.md`.
