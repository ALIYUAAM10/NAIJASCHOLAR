# Environment variables

Copy `.env.example` to `.env.local` for local scripts and Vercel Functions, and
`frontend/.env.example` to `frontend/.env.local` for Vite. Set server values in
the Vercel project dashboard. Never commit `.env.local` or service-account JSON.

## Server-only

| Variable | Required | Notes |
| --- | --- | --- |
| `FIREBASE_PROJECT_ID` | yes | Firebase project ID. |
| `FIREBASE_CLIENT_EMAIL` | production | Service-account email. Not needed with emulators. |
| `FIREBASE_PRIVATE_KEY` | production | Service-account private key, with `\n` escapes. |
| `FIREBASE_STORAGE_BUCKET` | production | Storage bucket, e.g. `project.appspot.com`. |
| `APP_CHECK_ENFORCE` | no | Set `true` only after the web client sends App Check tokens. |
| `ALLOWED_ORIGINS` | yes | Comma-separated CORS allowlist. |
| `LOG_HASH_SALT` | yes | Random salt for hashed UIDs in logs. |
| `CRON_SECRET` | production | Bearer secret for the future reminder cron endpoint. |
| `NODE_ENV` | no | `development`, `test` or `production`; defaults to `development`. |

The server refuses to start without a project ID. In production it also requires
a service-account email and private key. Emulator runs set the `*_EMULATOR_HOST`
variables instead.

## Client (public identifiers, not secrets)

Vite only reads `frontend/.env.local`. Duplicate the `VITE_*` values there.

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_VAPID_KEY` (future web push)
- `VITE_API_BASE_URL` (default `/api`)
- `VITE_USE_FIREBASE_EMULATORS` (`true` for local emulator development only)
- `VITE_FIREBASE_AUTH_EMULATOR_URL` (default `http://127.0.0.1:9099`)

These identifiers are visible in the bundle. They are not secrets; server trust
comes only from verified Firebase ID tokens.

## Emulators

| Command | Emulators | Purpose |
| --- | --- | --- |
| `npm run test:rules` | Auth, Firestore, Storage | Confirms deny-all client rules. |
| `npm run test:integration` | Auth, Firestore | Runs the API exam flow against a real Firestore emulator. |
| `npm run emulators` | Auth, Firestore, Storage | Long-running local stack. |
| `npm run seed:emulator` | Firestore | Seeds `demo-naijaprep` at `127.0.0.1:8080`. |

`tests/setup.ts` sets `FIREBASE_AUTH_EMULATOR_HOST`, `FIRESTORE_EMULATOR_HOST`
and `FIREBASE_STORAGE_EMULATOR_HOST` for test processes. No production
credentials are required.

For manual emulator development, uncomment these in `.env.local`:

```
FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099
FIRESTORE_EMULATOR_HOST=127.0.0.1:8080
FIREBASE_STORAGE_EMULATOR_HOST=127.0.0.1:9199
```

and set `VITE_USE_FIREBASE_EMULATORS=true` in `frontend/.env.local`.

## Seed script

`npm run seed` loads `scripts/sample-content.ts` through
`node --env-file=.env.local --import tsx scripts/seed.ts`. The script is
idempotent: existing exams are updated in place and creation timestamps are
preserved. Every seeded exam has `sample: true`.

## Rotation

If a secret is ever committed, rotate it first, then purge history. See
`docs/security-incident.md`.
