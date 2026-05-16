# Seamanship Exam App - Decision Log

Last updated: 2026-05-16  
Owner: Bar Amit

## Purpose

Track significant product and technical decisions with rationale and impact.  
Status values: `accepted`, `superseded`.

## Decisions

### 2026-02-15 - Anonymous Practice + Optional Sign-In

- Status: `accepted`
- Decision: Users can practice without an account. Authentication is required only for saved features (collections/progress).
- Reason: Reduce friction for practice while preserving personalization features.
- Impact: App must support both anonymous and authenticated flows.

### 2026-02-15 - Admin Access via Email Allowlist

- Status: `accepted`
- Decision: Admin authorization is controlled by allowlisted Google email(s).
- Reason: Simple, fast MVP control model.
- Impact: Server-side admin checks must enforce allowlist, not client-only checks.

### 2026-02-15 - Question Selection by Recency

- Status: `superseded`
- Decision: Prioritize least recently seen questions first.
- Reason: Keep algorithm simple and useful for revision coverage.
- Impact: Attempt history must store timestamps usable for recency sorting.

### 2026-02-15 - Timing Default

- Status: `accepted`
- Decision: Default timer is 6 minutes per question and user-customizable.
- Reason: Baseline pacing with flexibility per learner.
- Impact: Timer settings need per-test configuration and persistence rules.

### 2026-02-15 - Explanation Visibility Rule

- Status: `superseded`
- Decision: Explanations appear only in review mode after answer attempt.
- Reason: Preserve assessment flow and avoid answer leakage during solving.
- Impact: UI state must gate explanations by attempt status.

### 2026-02-15 - Navigation A Section-Based Scoring

- Status: `accepted`
- Decision: Navigation A supports section-based sub-questions with partial scoring.
- Reason: Some free-text questions are naturally multi-part.
- Impact: Data model includes `sub_questions[]` and `sub_question_grades[]`.

### 2026-02-15 - Sub-Question ID Normalization

- Status: `accepted`
- Decision: Store sub-question IDs as lowercase Latin (`a`,`b`,`c`,`d`) and render Hebrew labels in UI.
- Reason: Stable internal identifiers while preserving Hebrew user-facing labels.
- Impact: Import pipeline performs normalization and UI maps ID-to-label.

### 2026-02-15 - Navigation A Scoring Formula

- Status: `accepted`
- Decision: `question_score_percent = (successful_sub_question_answers / sub_questions_amount) * 100`.
- Reason: Equal section weighting is simple and transparent.
- Impact: Scoring module and tests must verify mixed section counts.

### 2026-02-15 - Equal Final Weight per Question

- Status: `accepted`
- Decision: In overall test score, each question has equal weight regardless of sub-question count.
- Reason: Preserve fairness between chapter types in final percentages.
- Impact: Aggregation logic must average per-question scores rather than per-section scores.

### 2026-02-15 - Image Metadata Denormalization

- Status: `accepted`
- Decision: Store image metadata on question documents at import; assets in Firebase Storage.
- Reason: Simplify read path and reduce join complexity in MVP.
- Impact: Import pipeline merges `asset` keys with image metadata source.

### 2026-02-15 - Dashboard Scope for MVP

- Status: `accepted`
- Decision: MVP dashboard includes per-tag accuracy only.
- Reason: Hit timeline while still providing actionable feedback.
- Impact: Streaks and completion trends move to post-MVP.

### 2026-02-15 - Legal Scope for MVP

- Status: `accepted`
- Decision: Implement legal baseline now (privacy/terms + consent placeholder); full GDPR/CCPA workflows post-MVP.
- Reason: Deliver faster with controlled legal scope.
- Impact: Add placeholder legal UX now; schedule full data lifecycle features later.

### 2026-02-15 - Documentation Split

- Status: `accepted`
- Decision: Separate long-term plan and MVP execution plan into `docs/product-plan.md` and `docs/mvp-plan.md`.
- Reason: Prevent scope mixing and improve agent task precision.
- Impact: `project.md` becomes pointer-only; docs folder is source of truth.

### 2026-02-15 - Environment and Release Policy

- Status: `accepted`
- Decision: Use isolated `dev`/`staging`/`prod` projects; auto-deploy to staging after CI; manual promote to production.
- Reason: Balance deployment speed and production safety.
- Impact: CI/CD pipeline must implement gating and rollback-ready release process.

### 2026-02-18 - Canonical Question Type Uses `open_text`

- Status: `accepted`
- Decision: Use `open_text` as the normalized question type for Navigation A records.
- Reason: Align implementation and docs with current generated dataset.
- Impact: Importer, validation, and UI filters should treat `open_text` as the free-response type.

### 2026-02-18 - Default Chapter Tag Applied to Every Question

- Status: `accepted`
- Decision: For MVP, each question gets one baseline tag derived from chapter (`seamanship`, `navigation a`, `navigation b`, `mechanics`).
- Reason: Enable immediate tag-based practice without waiting for full taxonomy enrichment.
- Impact: Import step normalizes empty tags to a deterministic chapter tag.

### 2026-02-18 - Remove `sq4-q096` from Final Dataset

- Status: `accepted`
- Decision: Exclude question `sq4-q096` from import-ready datasets.
- Reason: Question is repeated/source-broken and should not appear in user flows.
- Impact: Total canonical record count reduced by one.

### 2026-02-18 - Apply sq5 q102/q103 Choice Image Refs from Manifest

- Status: `accepted`
- Decision: Fill `choices[].image_ref` for `sq5-q102` and `sq5-q103` using `test_material/data/assets/sq5-option-images.json`.
- Reason: These questions are image-option MCQs and require per-choice assets.
- Impact: Importer must upload and persist per-choice image refs for these records.

### 2026-02-18 - Temporary Dual Asset Sources

- Status: `accepted`
- Decision: Keep temporary dual-source asset lookup in importer (`test_material/data/assets` + `test_material/test_images/images`) to support current sq5 and sq3 data.
- Reason: Current datasets are split between normalized and legacy asset locations.
- Impact: Add post-MVP task to consolidate all assets into a single canonical source and remove dual-source logic.

### 2026-02-18 - Future Flow Direction for Practice Modes

- Status: `accepted`
- Decision: Keep future separation between exam-oriented test flow and study-oriented tag flow.
- Reason: Users need both exam simulation and rapid learning/review loops.
- Impact:
- Tag flow should prioritize quick study-aid toggles (for example, explanations).
- Test flow should default to chapter-first selection with an explicit "all chapters" option.
- Question randomization/shuffle should primarily execute in backend logic.

### 2026-02-19 - MVP Question Selection Uses Random Backend Shuffle

- Status: `accepted`
- Decision: MVP keeps random question selection in backend APIs; recency-based selection is postponed to post-MVP.
- Reason: Keep implementation simple for MVP while preserving a clear upgrade path.
- Impact: Current practice APIs use random shuffle; recency weighting remains a later enhancement.

### 2026-02-19 - Explanation Visibility Is Mode-Specific

- Status: `accepted`
- Decision: Test flow keeps explanations in review mode only; tag-study flow allows optional quick reveal via study aids toggle.
- Reason: Preserve exam simulation integrity while supporting faster study loops in tag practice.
- Impact: Shared docs and future implementation must treat explanation visibility as flow-dependent, not global.

### 2026-02-19 - Admin Editor Scope for MVP

- Status: `accepted`
- Decision: Admin editor includes paginated search, text preview in result list, edit support for MCQ options/correct answer and open-text sub-questions, plus JSON toggles.
- Reason: Keep moderation workflow usable on large datasets and make data-level edits auditable during QA.
- Impact: Admin APIs support page/pageSize and editor sends structured patch payloads for both MCQ and open-text records.

### 2026-02-19 - Authoritative Server-Side Session Verification

- Status: `accepted`
- Decision: Protected APIs verify Firebase `auth_session` cookie server-side for authentication; admin authorization uses allowlist against verified email claim.
- Reason: Prevent cookie-tampering bypass where client-controlled metadata could influence authorization.
- Impact: Middleware is treated as UX gating only; API handlers remain the source of truth for auth and authorization.

### 2026-02-25 - Live Firestore as Operational Content Source

- Status: `accepted`
- Decision: Day-to-day question/content updates are done in the live app (Firestore). Importer remains for bootstrap/recovery/migrations, not routine editing.
- Reason: Admin editor is now available and better matches operational content workflows.
- Impact: Keep importer scripts maintained and runnable for environment seeding and disaster recovery; document that normal content changes should go through admin tools.

### 2026-02-26 - Centralized UI String Management

- Status: `accepted`
- Decision: All user-facing UI strings are stored in a single source file (`src/content/strings.js`) and consumed by pages/components.
- Reason: Make text updates fast and consistent, and prevent scattered hardcoded labels in UI markup.
- Impact: UI files import string keys/functions instead of embedding raw text; future UI features must add new labels in the central string source.

### 2026-02-26 - Progress Is Part of Dashboard

- Status: `accepted`
- Decision: Progress view is merged into dashboard; homepage points users to `/dashboard` ("אזור אישי") instead of a dedicated progress page.
- Reason: Reduce navigation depth and keep personal insights in one place.
- Impact: UI navigation should treat dashboard as the personal area entry point.

### 2026-05-16 - Active Work Moves From MVP Plan to Refactor Plan

- Status: `accepted`
- Decision: Treat `docs/refactor-plan.md` as the active implementation roadmap after the MVP baseline, with small short-lived branches from `staging`.
- Reason: MVP feature scope is complete enough that the next valuable work is maintainability, testability, and release reliability.
- Impact: Refactor work should preserve current product behavior, document each branch scope, run the relevant validation gates, and update roadmap/decision docs when architecture or workflow changes.

### 2026-05-16 - Refactor PRs Use CI Quality Gates

- Status: `accepted`
- Decision: Pull requests run unit tests, production build, and the critical Playwright smoke suite through GitHub Actions.
- Reason: The initial refactor sequence changed internal structure while preserving behavior, so future refactors need automated gates that protect core flows.
- Impact: Refactor PRs should keep `npm test`, `npm run build`, and `npm run test:e2e:smoke` green or document an explicit blocker before merge.

### 2026-05-16 - Domain Modules Move Under `src/features`

- Status: `accepted`
- Decision: Feature-owned business logic should move from `src/lib` into `src/features/<domain>` in small branches, starting with auth/session, collections, admin, practice-test, and tag-practice modules.
- Reason: The refactor roadmap targets lower coupling and clearer ownership boundaries.
- Impact: `src/features/auth`, `src/features/collections`, `src/features/admin`, `src/features/practice-test`, and `src/features/tag-practice` are canonical for those migrated modules. Temporary `src/lib/<domain>/*` and `src/lib/practice/*` re-exports remain during migration to avoid broad import churn.
