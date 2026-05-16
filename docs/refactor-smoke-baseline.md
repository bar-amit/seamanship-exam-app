# Refactor Smoke Baseline

Last updated: 2026-05-16  
Owner: Bar Amit

## Purpose

This smoke baseline locks the smallest browser-level behavior set that should stay stable during post-MVP refactors. It is not a replacement for the full E2E suite; it is the fast check for high-risk product paths before and after internal restructuring.

## Command

Run:

```bash
npm run test:e2e:smoke
```

The command starts the Next.js dev server through `playwright.config.mjs` with deterministic mocked backend routes and `ADMIN_ALLOWLIST=admin@example.com`.

## Covered Flows

- Anonymous practice test completion: `e2e/anonymous-practice.spec.js`
- Authenticated dashboard and collections access: `e2e/authenticated-saved-features.spec.js`
- Admin editor load, JSON inspection, and save: `e2e/admin-flow.spec.js`
- Review mode filtering and explanation visibility: `e2e/review-flow.spec.js`

## Run Policy

Run the smoke command on refactor branches that touch:

- Page/component wiring for practice, review, collections, dashboard, or admin.
- API route request/response contracts used by these flows.
- Auth/session, middleware, or admin allowlist behavior.
- Shared UI primitives used by these flows.

For lower-level pure module changes, run the targeted unit tests first and add the smoke command when browser wiring or user-visible flow risk exists.

## CI Policy

The smoke suite runs in `.github/workflows/ci.yml` after unit tests and build checks. This keeps pull requests from merging when a critical browser path breaks.

## Stability Notes

- Specs use Playwright route mocks for Firebase-backed APIs, so they do not require live Firebase credentials.
- The configured browser project is Chromium desktop only.
- Retries are enabled once by the shared Playwright config.
- A full E2E run remains available with `npm run test:e2e`.
