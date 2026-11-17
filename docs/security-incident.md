# Security incident: committed database credentials

The legacy `backend/.env.example` previously contained a Neon PostgreSQL URL
with a username and password. That backend was removed in Phase 2, so no working
file references the credential. The secret is still present in git history and
must be treated as compromised.

## Required actions (repo owner)

1. Rotate the Neon database password immediately.
2. Revoke any old connection strings or roles that used it.
3. Purge the file from git history. Choose one:
   - `git filter-repo --path backend/.env.example --invert-paths`
   - BFG Repo-Cleaner with a replacement file.
4. Force-push the rewritten history and tell collaborators to re-clone.
5. Check GitHub secret scanning and the Neon audit log for unexpected access.

Rotating the password is the only step that stops misuse. History rewriting is
cleanup, not containment.

## Prevent recurrence

- `.gitignore` ignores `.env`, `.env.*` and service-account JSON.
- `.env.example` and `frontend/.env.example` contain placeholders only.
- No database URL or JWT secret remains in the current codebase; those stacks
  were deleted after the Firebase cutover.
- Add a pre-commit secret scanner and enable GitHub push protection.
- Keep production credentials only in Vercel environment variables and never
  expose them with a `VITE_` prefix.
