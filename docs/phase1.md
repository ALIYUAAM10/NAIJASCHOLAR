# Phase 1 verification runbook

## Install

```bash
npm install
npm --prefix frontend ci
```

## Typecheck and lint

```bash
npm run typecheck
npm run lint
```

## Unit tests

```bash
npm test
```

Expected: auth, error envelope and cursor tests pass; no emulator required.

## Security-rules tests

Requires Java 11+ for the Firestore emulator.

```bash
npm run test:rules
```

Expected: anonymous and authenticated Firestore/Storage access is denied.

## Frontend build

```bash
npm run build
```

Output: `frontend/dist`.

## Local API

```bash
npx vercel dev
curl -s http://localhost:3000/api/health
```

`/api/me` requires a Firebase ID token:

```bash
curl -s -H "Authorization: Bearer <id-token>" \
  http://localhost:3000/api/me
```

## Historical note

This runbook documents Phase 1 only. The UI no longer calls the legacy Express
endpoints: the Firebase Auth frontend cutover and Firestore exam APIs were
completed in Phase 2. See `docs/phase2.md` for the current verification runbook.
