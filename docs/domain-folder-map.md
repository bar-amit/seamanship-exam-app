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

### Remaining Domains

Status: pending.

- Practice test logic currently lives under `src/lib/practice` and `app/practice/page.js`.
- Tag practice logic currently shares `src/lib/practice` and `app/practice/tags/page.js`.
- Collections service logic currently lives under `src/lib/collections`.
- Admin service logic currently lives under `src/lib/admin`.

## Migration Rules

- Move one domain per branch.
- Keep public routes and API response shapes stable.
- Prefer compatibility re-exports for one migration phase when moving modules with many imports.
- Update this map in each M2 branch.
- Run targeted domain tests plus `npm test` and `npm run build`.
