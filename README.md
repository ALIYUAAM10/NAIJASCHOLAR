# NaijaPrep Quiz

A mobile-first, low-bandwidth exam-practice PWA for Nigerian students preparing
for JAMB/UTME, WAEC/NECO and Post-UTME. Students take timed mocks, get instant
server-evaluated scores, review static explanations, and track progress.

## Migration status: Phase 2 complete

The app now runs on Vercel Functions + Firebase. The legacy Express,
PostgreSQL/JWT backend and Render configuration have been removed.

- **Frontend:** React 18 + Vite SPA in `frontend/`, Firebase Auth client SDK only.
- **API:** Vercel Node Functions in `api/`; Zod validation and a consistent JSON
  error envelope.
- **Auth:** Firebase Auth (Google and email/password). Every protected route
  verifies the ID token with the Firebase Admin SDK. Client-sent UIDs are never
  trusted.
- **Data:** Firestore, accessed only from server code. Direct client access is
  denied by rules.
- **Content:** sample exams are seeded from `scripts/sample-content.ts` and are
  explicitly marked `sample: true`. The full study content is generated from the
  ported legacy JSON in `frontend/public/data/` by `scripts/content.ts`, covering
  JAMB subjects/topics, a full mock, and university course units.
- **No AI dependency:** all explanations, hints and study tips are static
  Firestore content served through cached API responses. No model or provider is
  required by any feature.

## What works today

- Google and email/password sign-in, sign-out, and friendly auth errors.
- Exam list and detail endpoints with answer keys stripped from public payloads.
- Idempotent mock sessions using client-generated IDs.
- Atomic submission: score, complete the session, and update the profile in one
  Firestore transaction.
- Dashboard stats, per-subject progress, and the latest ten attempts from one
  profile document.
- Cursor pagination on list endpoints and CDN caching for the public exam list.
- Deny-all Firestore and Storage rules plus emulator-based rules tests.
- A study hub with JAMB/university paths, 15 JAMB subjects and topic practice,
  a 100-question full mock, faculty/course browsing, levels 100-600, GST units,
  course-unit practice, search, a searchable study library and past questions.
- Local study tools: plan builder, streak tracker, CGPA calculator, contribution
  guide, one-question-at-a-time quiz view, question palette, and topic breakdowns.

## Repository layout

```
api/                       Vercel Functions and server-only libraries
  _lib/                    auth, Firestore, validation, scoring, profile, errors
  exams/                   GET /api/exams, GET /api/exams/:examId
  mock-sessions/           POST /api/mock-sessions, submit route
  attempts/                GET /api/attempts
  progress/                GET /api/progress
  me.ts                    GET/PATCH /api/me
  health.ts                GET /api/health
frontend/                  React/Vite PWA and Firebase Auth client
scripts/                   sample content and idempotent Firestore seeder
tests/unit/                pure unit tests
tests/integration/         API flow tests against the Firestore emulator
tests/rules/               deny-all rules tests
firestore.rules            deny-all client rules
firestore.indexes.json     composite indexes
```

## Local setup

Prerequisites: Node 20.11+, Java 11+ (Firestore emulator), the Firebase CLI and
Vercel CLI (`npx firebase`, `npx vercel`).

```bash
npm install
npm --prefix frontend install

cp .env.example .env.local
cp frontend/.env.example frontend/.env.local
```

Fill in the server values in `.env.local` and the public `VITE_FIREBASE_*`
values in `frontend/.env.local`. Enable Google and email/password providers in
the Firebase console and add `localhost` to the authorized domains.

### Option A: real Firebase project

```bash
npm run seed          # loads sample exams into Firestore
npm run dev:api       # Vercel Functions at http://localhost:3000
npm run dev:web       # Vite at http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:3000`.

### Option B: emulators

```bash
npm run emulators                 # Auth :9099, Firestore :8080, Storage :9199
npm run seed:emulator             # loads sample exams into the emulator
```

In `frontend/.env.local`, set `VITE_USE_FIREBASE_EMULATORS=true`. Use any
non-empty values for the public Firebase identifiers; the client will talk to
the Auth emulator. In `.env.local`, uncomment the `*_EMULATOR_HOST` variables so
server code uses the emulators. Then run `npm run dev:api` and `npm run dev:web`
in separate terminals.

## Common commands

| Command | Purpose |
| --- | --- |
| `npm run typecheck` | TypeScript strict check |
| `npm run lint` | ESLint with zero warnings |
| `npm test` | Unit tests (no emulator needed) |
| `npm run test:rules` | Deny-all Firestore/Storage rules tests |
| `npm run test:integration` | Firestore-backed exam flow tests |
| `npm run build` | Typecheck plus production frontend bundle |
| `npm run seed` | Idempotent sample-content seed |
| `npm run seed:emulator` | Same seed against `demo-naijaprep` |

## API

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | no | Liveness probe and request ID |
| GET | `/api/exams` | no | Published exams, cursor paginated, CDN cached |
| GET | `/api/exams/:examId` | no | Exam metadata and public questions |
| POST | `/api/mock-sessions` | yes | Start/resume a session; body `{ examId, sessionId }` |
| POST | `/api/mock-sessions/:sessionId/submit` | yes | Submit `{ answers }`, idempotent |
| GET | `/api/attempts` | yes | Completed attempts, cursor paginated |
| GET | `/api/progress` | yes | Overall stats and per-subject progress |
| GET/PATCH | `/api/me` | yes | Read/update username and leaderboard opt-in |

All list responses use `{ items, nextCursor }`. Errors use
`{ error: { code, message, details?, requestId? } }`.

## Firestore model and cost

- `exams/{examId}` embeds questions, `correctOption` and optional static
  `explanation`. Public responses strip answers and explanations.
- `users/{uid}` stores denormalized stats, per-subject progress and the last ten
  attempts. The dashboard reads one document.
- `users/{uid}/mockSessions/{sessionId}` uses client-generated IDs, stores
  `in_progress`/`completed` status and the final result for idempotent retries.

Approximate Spark-tier cost for a fresh mock:

| Screen/action | Reads | Writes |
| --- | --- | --- |
| Dashboard | 1 | 0 |
| Start mock (session check + exam) | 2 | 1 |
| Submit (session + exam + profile) | 3 | 2 |
| Exam list | amortized by 5-minute CDN cache | 0 |

Deploy indexes with `firebase deploy --only firestore:indexes`. Rules are
deployed with `firebase deploy --only firestore:rules,storage`.

## Security notes

- Firestore and Storage rules deny all direct client access; the browser only
  uses Firebase Auth and calls `/api`.
- App Check is enforced when `APP_CHECK_ENFORCE=true`; keep it `false` locally
  until the web App Check token is configured.
- CORS uses an explicit `ALLOWED_ORIGINS` allowlist for write methods.
- Never commit `.env.local` or service-account JSON. See
  `docs/security-incident.md` for the historical Neon credential exposure and
  required owner actions.

## Documentation

- `docs/phase1.md` — Phase 1 verification runbook (historical).
- `docs/phase2.md` — Phase 2 cutover details and verification.
- `docs/architecture.md` — runtime shape, data model, trust boundary.
- `docs/env.md` — environment variable reference.
- `docs/migration.md` — migration history and remaining phases.
- `docs/compatibility.md` — browser support, budgets, low-end checklist.
- `docs/security-incident.md` — leaked credential follow-up.

## Next phase (Phase 3)

Offline-first PWA work: compact per-exam/subject bundles, service worker caching,
IndexedDB attempt queue with idempotent sync, resume-active-session, conflict
and retry handling, plus low-end device testing. App Check enforcement, rate
limiting, a full history UI, study planner and a reviewed content pipeline are
planned for later phases.
