# Staging Prerequisites

Last updated: 2026-05-20  
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
- 2026-05-20: local `.env.staging` validation passed with `npm run validate:env:staging`.

## Firebase Project Setup

- [-] Create/select staging Firebase project.
- [-] Enable Firebase Authentication, Firestore, and Storage.
- [-] Enable Google provider in Authentication.
- [-] Add authorized domains for staging and local test domains:
  - `localhost`
  - staging domain

## Firebase App Hosting (Staging)

- [-] Ensure Firebase CLI is recent (`firebase --version`, recommended >= 14.4.0).
- [-] Initialize App Hosting once in this repo:
  - `firebase init apphosting`
- [-] Create/configure staging backend to use `apphosting.staging.yaml`.
- [-] Fill `apphosting.staging.yaml` placeholders (`__REPLACE_ME__`) with staging values.
- [-] Set staging secret for private key:
  - `firebase apphosting:secrets:set FIREBASE_PRIVATE_KEY`
- [-] Deploy app to staging:
  - `firebase deploy --project <staging-project-id>`

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

- [x] Dry-run importer with staging env settings first:
  - `npm run import:phase2:staging:dry`
  - 2026-05-20 result after positioning-diagram rendering: `827` records, `78` referenced assets, no missing assets, validation errors `0`, expected warnings `19`.
- [-] Run full importer against staging project:
  - `npm run import:phase2:staging`
- [-] Confirm expected question count and sample image accessibility.

Importer recovery/audit details:

- `docs/import-recovery-runbook.md`

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
