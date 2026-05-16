# AGENTS.md

Purpose: quick operational instructions for coding agents working in this repository.

## Source Of Truth

- Strategy and long-term scope: `docs/product-plan.md`
- Current implementation scope: `docs/mvp-plan.md`
- Post-MVP refactor roadmap: `docs/refactor-plan.md`
- Decisions and tradeoffs: `docs/decision-log.md`
- Agent workflow references:
  - `docs/agent-workflow-guide.md`
  - `docs/agent-cheatsheet.md`
- Staging execution docs:
  - `docs/staging-prerequisites.md`
  - `docs/staging-smoke-checklist.md`

## Working Rules

- Implement only requested phase/scope from `docs/mvp-plan.md`.
- Respect `Out of Scope` items.
- Update docs when behavior/scope changes.
- Add decision entries for new technical/product decisions.
- Do not commit secret env files (`.env.local`, `.env.staging`, `.env.production`).

## Security Model (Must Follow)

- Middleware is UX gate only.
- API routes are authoritative auth boundary.
- Protected APIs must verify Firebase `auth_session` server-side.
- Admin APIs must enforce allowlist from verified email claim.
- `user_email` cookie is metadata only; never trust it for authorization.

## Default Validation

- Unit tests: `npm test`
- Build: `npm run build`
- E2E: `npm run test:e2e`

## Environment And Data Commands

- Validate staging env: `npm run validate:env:staging`
- Staging import dry run: `npm run import:phase2:staging:dry`
- Staging import full: `npm run import:phase2:staging`

## Expected Delivery Format

- Code changes
- Test/build results
- Updated docs (if behavior/scope changed)
- Open risks/blockers (short, concrete)
