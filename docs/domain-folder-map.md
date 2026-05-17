# Domain Folder Map

Last updated: 2026-05-16  
Owner: Bar Amit

## Purpose

This document tracks the M2 domain-oriented structure migration. The migration should happen in small, behavior-preserving branches.

## Target Map

- `src/features/auth`: authentication/session policy and client session synchronization.
- `src/features/practice-test`: timed/random practice test flow logic.
- `src/features/tag-practice`: tag-study flow logic.
- `src/features/collections`: private collection domain services and helpers.
- `src/features/admin`: admin question editing/listing services and helpers.
- `src/lib`: shared infrastructure and utilities used by multiple features.
- `src/components`: shared UI components and feature-neutral primitives.
- `src/content`: centralized user-facing strings.

## Migration Status

### Auth

Status: migrated.

Canonical modules:

- `src/features/auth/allowlist.js`
- `src/features/auth/client-session.js`
- `src/features/auth/guard.js`
- `src/features/auth/middleware-policy.js`
- `src/features/auth/server-session.js`
- `src/features/auth/session.js`

Compatibility re-exports remain under `src/lib/auth/*` so old imports continue to work during the M2 migration.

### Collections

Status: migrated.

Canonical modules:

- `src/features/collections/add-question.js`
- `src/features/collections/schema.js`
- `src/features/collections/service.js`

Compatibility re-exports remain under `src/lib/collections/*` so old imports continue to work during the M2 migration.

### Admin

Status: migrated.

Canonical modules:

- `src/features/admin/question-edit.js`
- `src/features/admin/service.js`

Compatibility re-exports remain under `src/lib/admin/*` so old imports continue to work during the M2 migration.

### Tag Practice

Status: migrated.

Canonical modules:

- `src/features/tag-practice/tags.js`
- `src/features/tag-practice/persistence.js`
- `src/features/tag-practice/progress.js`
- `src/features/tag-practice/session.js`

Compatibility re-exports remain under `src/lib/practice/*` and `src/lib/progress/tag-progress.js` so old imports continue to work during the M2 migration.

### Practice Test

Status: migrated.

Canonical modules:

- `src/features/practice-test/persistence.js`
- `src/features/practice-test/analytics.js`
- `src/features/practice-test/review.js`
- `src/features/practice-test/session.js`
- `src/features/practice-test/setup.js`

Compatibility re-exports remain under `src/lib/practice/*` for shared practice helpers and old tag-practice imports.

### M2 Wiring Status

Status: complete for current domains.

- `app/practice/page.js` now consumes canonical practice-test feature modules.
- `app/practice/tags/page.js` now consumes canonical tag-practice and practice-test feature modules.

## Migration Rules

- Move one domain per branch.
- Keep public routes and API response shapes stable.
- Prefer compatibility re-exports for one migration phase when moving modules with many imports.
- Update this map in each M2 branch.
- Run targeted domain tests plus `npm test` and `npm run build`.
