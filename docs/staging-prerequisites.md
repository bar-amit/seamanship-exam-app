# Staging Prerequisites

Last updated: 2026-02-19  
Owner: Bar Amit

This checklist is the execution companion for the staging section in `docs/mvp-plan.md`.

## Required Inputs (Fill First)

- [-] Staging Firebase project id (expected: `seamanship-staging`)
- [-] Staging web domain (example: `staging.example.com`)
- [-] Admin allowlist emails for staging
- [-] Service account key for staging project (`FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`)
- [-] Confirm where staging env vars are stored (CI/CD secrets manager)

## Environment Files and Validation

1. Create local staging env file:
   - `cp .env.staging.example .env.staging`
2. Fill all required variables in `.env.staging`.
3. Validate env format and required keys:
   - `npm run validate:env:staging`

Notes:

- `FIREBASE_PROJECT_ID` must match `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
- `FIREBASE_PRIVATE_KEY` can include escaped newlines (`\\n`), app code normalizes it.

## Firebase Project Setup

- [-] Create/select staging Firebase project.
- [-] Enable Firebase Authentication, Firestore, and Storage.
- [-] Enable Google provider in Authentication.
- [-] Add authorized domains for staging and local test domains:
  - `localhost`
  - staging domain

## Security and Access

- [-] Configure `ADMIN_ALLOWLIST` for staging.
- [-] Confirm API auth model:
  - `auth_session` is verified server-side in protected APIs.
  - `user_email` is non-authoritative metadata only.
- [-] Validate admin route access with allowlisted and non-allowlisted users.
- [-] Deploy Firebase rules from repo:
  - `firebase deploy --project <staging-project-id> --only firestore:rules,storage`

Rules files in this repo:

- Firestore: `firestore.rules`
- Storage: `storage.rules`
- Firebase config: `firebase.json`

## Data and Assets

- [-] Dry-run importer with staging env settings first:
  - `npm run import:phase2:dry`
- [-] Run full importer against staging project:
  - `npm run import:phase2`
- [-] Confirm expected question count and sample image accessibility.

## Quality Gates Before Promote

- [-] Unit tests pass:
  - `npm test`
- [-] E2E tests pass:
  - `npm run test:e2e`
- [-] Build passes:
  - `npm run build`
- [ ] Smoke pass on staging (desktop + mobile)
- [ ] Logging/error monitoring receives staging events

Smoke checklist document:

- `docs/staging-smoke-checklist.md`

## Sign-off

- [ ] Engineering sign-off
- [ ] Content/admin sign-off
- [ ] Release decision recorded in `docs/decision-log.md` (if policy/flow changed)
