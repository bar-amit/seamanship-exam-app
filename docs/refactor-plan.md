# Seamanship Exam App - Refactor Plan

Last updated: 2026-05-17  
Owner: Bar Amit

## Purpose

This document defines the post-MVP refactor roadmap to raise maintainability, testability, and operational reliability without breaking current product behavior.

Related:

- Long-term product plan: `docs/product-plan.md`
- MVP execution plan: `docs/mvp-plan.md`
- Decision history: `docs/decision-log.md`

## Refactor Principles

- Preserve product behavior unless a change is explicitly approved.
- Refactor in vertical slices; avoid big-bang rewrites.
- Lock behavior with tests before and during refactors.
- Keep API security boundaries unchanged (`auth_session` server verification and admin allowlist checks).

## Target Outcomes

- Lower coupling between UI and business logic.
- Deterministic auth/session behavior across client and server.
- Clear API contracts with consistent error handling.
- Faster, more stable tests with better coverage.
- Easier onboarding for new contributors and coding agents.

## Milestone Plan

### M1: Engineering Baseline

- Add/confirm repository-wide standards (lint, formatting, code conventions, CI gates).
- Freeze current behavior with a minimal critical E2E smoke set.
- Define refactor acceptance checklist per PR.

Deliverables:

- Updated CI quality checks (`.github/workflows/ci.yml`)
- Baseline smoke suite and stability report (`docs/refactor-smoke-baseline.md`)
- Refactor PR template/checklist (`.github/pull_request_template.md`)

### M2: Domain-Oriented Structure

- Reorganize code into feature domains:
- `src/features/auth`
- `src/features/practice-test`
- `src/features/tag-practice`
- `src/features/collections`
- `src/features/admin`
- Keep shared utilities only when used by 2+ features.

Deliverables:

- New folder map and migration notes (`docs/domain-folder-map.md`)
- No functional change release

Initial migration branch:

- `refactor/m2-feature-auth-domain`: moves auth/session modules to `src/features/auth` and keeps `src/lib/auth/*` compatibility re-exports.
- `refactor/m2-feature-collections-domain`: moves collection modules to `src/features/collections` and keeps `src/lib/collections/*` compatibility re-exports.
- `refactor/m2-feature-admin-domain`: moves admin modules to `src/features/admin` and keeps `src/lib/admin/*` compatibility re-exports.
- `refactor/m2-feature-practice-domains`: starts tag-practice migration by moving tag selection/filter helpers to `src/features/tag-practice`.
- `refactor/m2-feature-practice-test-domain`: moves shared practice test session/review/persistence/analytics helpers to `src/features/practice-test` and keeps `src/lib/practice/*` compatibility re-exports.
- `refactor/m2-feature-tag-practice-domain`: moves tag-practice persistence/progress helpers to `src/features/tag-practice` and keeps aggregate compatibility exports under `src/lib/practice/*`.
- `refactor/m2-practice-page-domain-wiring`: rewires `app/practice/page.js` and `app/practice/tags/page.js` to consume canonical `src/features/practice-test/*` and `src/features/tag-practice/*` modules.

### M3: UI vs Logic Separation

- Extract page/component logic into pure modules or reducers.
- Keep components focused on rendering and interaction wiring.
- Isolate side effects (fetch, localStorage, analytics) behind adapters.

Deliverables:

- Pure logic modules with unit coverage
- Reduced state complexity in page files

### M4: API Contract and Handler Refactor

- Standardize API request/response shape and error envelope.
- Convert route handlers to thin controllers delegating to domain services.
- Enforce consistent request validation and authorization flow.

Deliverables:

- Shared API contract helpers
- Route/service split in high-change areas first (collections, admin, auth)

### M5: Auth and Session Stabilization

- Consolidate session synchronization paths (login, logout, refresh).
- Define one explicit UI auth state update mechanism.
- Remove duplicated auth state handling paths.

Deliverables:

- Auth state source-of-truth implementation
- Integration tests for login/logout/session propagation

### M6: Test Pyramid Upgrade

- Expand unit tests for domain rules and session logic.
- Add integration tests for API handlers with mocked Firebase adapters.
- Keep E2E focused on critical user journeys and security-sensitive flows.

Deliverables:

- Coverage map by domain
- Flake reduction and test runtime report

### M7: Shared UI Primitives and Accessibility

- Standardize reusable UI primitives (`PageHeader`, `Modal`, `Button`, `FormField`, status messages).
- Normalize keyboard/focus/aria behavior for overlays and menus.
- Remove duplicated markup and styling patterns.

Deliverables:

- Shared component primitives
- Accessibility checklist pass for primary flows

### M8: Import/Data Lifecycle Hardening

- Split importer into parse, normalize, validate, persist stages.
- Improve dry-run reporting and audit output.
- Keep canonical data source rules explicit in code and docs.

Deliverables:

- Pipeline stage modules
- Import audit output and recovery runbook

### M9: Observability and Release Reliability

- Standardize structured error logging in API paths.
- Add release quality gates (unit, integration, E2E smoke, build).
- Improve rollback and diagnostics documentation.

Deliverables:

- Logging and error taxonomy conventions
- CI gate policy updates

### M10: Governance and Knowledge Transfer

- Update `docs/mvp-plan.md`/`docs/product-plan.md` as boundaries evolve.
- Record major refactor decisions in `docs/decision-log.md`.
- Keep agent instructions aligned in `AGENTS.md`.

Deliverables:

- Updated documentation set
- Definition of Done for future feature/refactor work

## Execution Model

For each milestone:

1. Lock behavior with tests.
2. Refactor internal structure.
3. Run validation suite (`npm test`, `npm run build`, targeted E2E).
4. Update docs and decisions.
5. Merge only when acceptance checklist is green.

## Branch Strategy

Use short-lived branches from `staging`, one branch per behavior-preserving slice. Prefer branch names that include the milestone and the concrete area touched:

- `refactor/m1-operating-baseline`
- `refactor/m1-smoke-suite`
- `refactor/m2-feature-folders-auth`
- `refactor/m3-practice-session-logic`
- `refactor/m4-collections-api-service`
- `refactor/m4-admin-api-service`

Branch rules:

- Keep each branch reviewable in one sitting.
- Move files separately from behavior changes where possible.
- Do not mix unrelated cleanup with a domain refactor.
- Keep public route paths and API behavior stable unless a behavior change is explicitly approved.
- Include validation results in the PR notes.
- Update this plan when the sequence changes.

## Refactor PR Checklist

Each refactor PR should include:

- Scope: milestone, feature/domain, and what stayed intentionally unchanged.
- Behavior lock: tests added or identified as protecting the current behavior.
- Security check: confirmation that protected APIs still verify `auth_session` server-side and admin APIs still use the verified email allowlist.
- Validation: `npm test`, `npm run build`, and targeted E2E when the touched flow needs it.
- Docs: updated plan/decision entries if scope, architecture, or workflow changed.
- Risk: short list of remaining risks or follow-up branches.

## First Priority Slices

1. Auth/session synchronization cleanup.
2. Practice flow state logic extraction to pure modules.
3. Collections and admin API controller/service standardization.

## Initial Small-Step Sequence

Status: completed on 2026-05-16. The sequence established baseline gates, stabilized auth/session sync, extracted shared practice response logic, and split collections/admin API route handlers into service modules.

### Step 1: M1 Operating Baseline

Branch: `refactor/m1-operating-baseline`

Scope:

- Document branch strategy and PR checklist.
- Confirm current scripts and test entry points.
- No product behavior or code structure changes.

Validation:

- `npm test`
- `npm run build`

### Step 2: M1 Critical Smoke Baseline

Branch: `refactor/m1-smoke-suite`

Scope:

- Identify the smallest E2E set that locks anonymous practice, authenticated saved features, admin access, and review flow.
- Add a short stability note with commands and any known environment assumptions.
- Add a dedicated smoke command for the selected specs.
- No product behavior changes.

Validation:

- `npm test`
- `npm run test:e2e:smoke`

### Step 3: M5 Auth/Session Inventory and Cleanup

Branch: `refactor/m5-auth-session-source-of-truth`

Scope:

- Inventory login, logout, refresh, middleware, and server verification paths.
- Consolidate duplicated client auth state handling only after tests cover current behavior.
- Record auth/session source-of-truth notes in `docs/auth-session-refactor-notes.md`.
- Preserve API route authorization boundaries.

Validation:

- `npm test -- tests/client-session.test.js tests/session.test.js tests/server-session.test.js tests/guard.test.js tests/middleware-policy.test.js`
- `npm run build`

### Step 4: M3 Practice Session Logic Extraction

Branch: `refactor/m3-practice-session-logic`

Scope:

- Extract practice flow state transitions into pure modules or reducers.
- Keep page/component behavior stable.
- Add focused unit coverage for extracted logic.
- Start with shared response creation and update helpers used by test practice and tag practice.

Validation:

- `npm test -- tests/practice-session.test.js tests/practice-review.test.js tests/practice-persistence.test.js`
- Targeted anonymous practice/review E2E if UI wiring changes.

### Step 5: M4 Collections API Service Split

Branch: `refactor/m4-collections-api-service`

Scope:

- Split collection route handlers into thin route/controller code and domain services.
- Keep request/response shapes stable.
- Preserve server-side `auth_session` verification.
- Consolidate list/create/update/delete collection operations in `src/features/collections/service.js`.

Validation:

- `npm test -- tests/collections-route.test.js tests/collections-schema.test.js tests/add-to-collection.test.js`
- `npm run build`

### Step 6: M4 Admin API Service Split

Branch: `refactor/m4-admin-api-service`

Scope:

- Split admin question route handlers into route/controller code and admin domain services.
- Keep admin allowlist checks based on verified email claims.
- Keep editor payload shape stable.
- Consolidate admin question list/get/update operations in `src/features/admin/service.js`.

Validation:

- `npm test -- tests/admin-service.test.js tests/admin-question-edit.test.js tests/allowlist.test.js tests/server-session.test.js`
- Targeted admin E2E when route wiring changes.

## Definition of Done (Refactor PR)

- No unapproved behavior change.
- Tests added/updated at the right layer.
- Security boundaries preserved.
- Docs updated (`mvp-plan`, `decision-log`, and this plan when applicable).
- Validation results attached in PR notes.

## 2026-05-17 Convergence Run

Status: completed for the current in-scope refactor-plan loop.

Branch: `refactor/m2-feature-practice-domains`

Completed slices:

- M4/M6 API route testability: collection/admin API routes expose dependency-injectable handlers while production exports still use verified `auth_session`/admin allowlist dependencies. Added route-level integration coverage in `tests/api-route-handlers.test.js`.
- M8 import lifecycle hardening: `scripts/import-phase2.js` delegates CLI config parsing, upload planning, and report construction to `src/lib/import/pipeline.js`. Added focused coverage in `tests/import-pipeline.test.js` and verified a dry-run limited import without Firebase credentials.
- M8 validation/recovery hardening: import validation lives in `src/lib/import/validate.js`; the CLI stops before upload/Firestore writes on blocking validation errors and includes validation errors/warnings in the audit report. Added `tests/import-validate.test.js` and `docs/import-recovery-runbook.md`.
- M9 observability: API route catch blocks use `src/lib/api/logging.js` for structured error events before returning the existing JSON error envelope. Added coverage in `tests/api-logging.test.js`.
- M7 accessibility primitives: shared dialog helpers live in `src/lib/a11y/dialog.js`; collection and image modals use consistent dialog labeling and Escape dismissal behavior. Added coverage in `tests/dialog-a11y.test.js`.
- M10 governance: `docs/domain-folder-map.md` and `docs/decision-log.md` were updated for the new shared modules and decisions.

Validation baseline:

- `npm test` passed with 137 tests.
- `npm run build` passed.
- Import dry-run smoke passed: `node scripts/import-phase2.js --dry-run --skip-upload --skip-firestore --limit 1 --report /tmp/seamanship-import-report.json`.
- Full import dry-run audit passed after validation-stage extraction: `node scripts/import-phase2.js --dry-run --skip-upload --skip-firestore --report /tmp/seamanship-import-report-full.json` reported 826 importable records, 46 referenced assets, no missing assets, and 14 non-blocking open-text sub-question warnings.

Explicit follow-ups outside this convergence loop:

- Modal focus trapping is not implemented; current M7 work standardizes dialog role/label/dismiss behavior only.
- Live Firebase import/upload/firestore execution still depends on staging credentials and should be validated with the staging import commands before operational use.
- Full browser E2E smoke remains the release gate when preparing the branch for merge.
