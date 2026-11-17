# Compatibility policy

## Minimum browsers

- Chrome 80+ on Android (primary target).
- Firefox 78+.
- Safari 14+.
- No Internet Explorer.

## Progressive enhancement

Feature-detect before use:

- Service workers: offline bundles. If unavailable, the app works online only.
- Notifications / Push API: if unavailable, reminders stay in-app.
- IndexedDB: if unavailable, queue attempts in memory and retry while open.
- `Intl.DateTimeFormat` time zones: fall back to `Africa/Lagos` (UTC+1, no DST).

Never clear all local storage as an error-recovery tactic. Scope cleanup to the
specific corrupted key.

## Budgets

- Initial JS: < 180 KB gzip. Phase 2 build is ~90 KB gzip (Firebase Auth plus
  the React app).
- API JSON: < 50 KB per screen. Sample exams have 5 questions each.
- Question bundle: < 100 KB gzip per subject (Phase 3 offline bundles).
- No moment.js, lodash, heavy UI kits or client Firestore SDK. The Firebase
  Auth client SDK is required; Firestore remains server-only.
- Code-split quiz/result screens in Phase 3 if the bundle grows past budget.

## Low-end test checklist (Phase 7)

- Chrome DevTools: 3G throttling, 4x CPU slowdown.
- 2 GB RAM Android device or emulator.
- Cold start with empty cache, then repeat offline.
- Rotate to airplane mode mid-mock; submit after reconnect.
- Small screen: 320 px wide, large text.
- Deny notification permission; confirm in-app fallback.
- Old Android WebView / Chrome 80 smoke test.
