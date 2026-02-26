# Release Flow

Last updated: 2026-02-26  
Owner: Bar Amit

Purpose: define a simple, repeatable release process for local validation, staging deploy, and production promotion.

## Branch Model

- `main`: integration branch for completed features.
- `staging`: deployment branch for staging environment only.
- feature branches: short-lived branches merged into `main`.

## Promotion Path

1. Merge feature branch into `main`.
2. Run local quality gates on `main`.
3. Merge `main` into `staging`.
4. Deploy `staging` to Firebase App Hosting staging backend.
5. Run staging smoke checklist.
6. If pass, promote same commit to production flow.

## Required Gates Before Staging Deploy

Run from repo root:

```bash
npm test
npm run build
npm run test:e2e
npm run validate:env:staging
```

## Staging Deploy Commands

```bash
firebase deploy --project seamanship-exam-app-staging --only firestore:rules,storage
firebase deploy --project seamanship-exam-app-staging
```

Then run:

- `docs/staging-smoke-checklist.md`

## Tagging Convention

After successful staging validation, create annotated tag on deployed commit:

- format: `staging-YYYY-MM-DD.N`
- example: `staging-2026-02-26.1`

## Rollback Rule

- If staging fails smoke checks, do not promote.
- Roll back by redeploying last known-good staging tag commit.
- Record incident and resolution in `docs/decision-log.md` when process/policy changes are required.

## Operating Rules

- No direct server hotfixes; all changes must come from git commits.
- Keep `staging` branch deployable at all times.
- Keep secrets out of git (`.env.local`, `.env.staging`, `.env.production` are never committed).
