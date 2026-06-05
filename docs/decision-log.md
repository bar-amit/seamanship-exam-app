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

### 2026-05-17 - API Routes Use Shared Response Helpers

- Status: `accepted`
- Decision: Route files translate service results through `src/lib/api/response.js` helpers instead of calling `NextResponse.json` directly in each handler.
- Reason: Keep route handlers thin and make status/body/error/cookie response behavior consistent while API service modules own domain logic.
- Impact: Route handlers should return service results with `{ status, body }` and use `jsonResult`, `jsonError`, or `jsonResultWithCookies` for the Next.js response boundary.

### 2026-05-17 - API Errors Use Structured Log Payloads

- Status: `accepted`
- Decision: API route catch blocks use `src/lib/api/logging.js` to emit structured error events before returning the existing JSON error envelope.
- Reason: The M9 reliability work needs consistent diagnostics without logging request bodies, cookies, tokens, or other sensitive data.
- Impact: New API routes should use `jsonLoggedError` at the route boundary and include stable route/method/status metadata in log events.

### 2026-05-17 - Refactor Plan Convergence Loop Completed

- Status: `accepted`
- Decision: Treat the 2026-05-17 convergence run as complete for the currently requested in-scope refactor-plan loop after API route integration coverage, import pipeline extraction, structured API logging, dialog accessibility helpers, and governance documentation updates.
- Reason: The remaining items after these slices are operational/release validations or deeper follow-ups rather than required behavior-preserving refactor steps in this loop.
- Impact: Future work should start from explicit follow-ups in `docs/refactor-plan.md` instead of re-opening the completed convergence loop.

### 2026-05-17 - Importer Blocks Persistence on Validation Errors

- Status: `accepted`
- Decision: The phase 2 importer validates normalized questions before asset upload or Firestore writes, and writes validation results into the import audit report.
- Reason: Importer is used for bootstrap/recovery, so invalid normalized records should fail before creating partial data writes while still leaving enough report detail to recover.
- Impact: `scripts/import-phase2.js` must keep validation ahead of persistence. Blocking errors require data or normalization fixes before rerun; warnings may proceed when they reflect supported app behavior.

### 2026-05-17 - Modals Use Shared Focus Management

- Status: `accepted`
- Decision: App modal overlays use shared dialog helpers for initial focus, Tab focus trapping, Escape dismissal, and focus restoration.
- Reason: Modal accessibility should be consistent across collection and image dialogs without duplicating keyboard handling in each component.
- Impact: New modal implementations should reuse `src/lib/a11y/dialog.js` helpers or an eventual shared Modal primitive rather than hand-rolling focus behavior.

### 2026-05-20 - Extracted Data Becomes Import Source

- Status: `accepted`
- Decision: Use `test_material/data/questions-all.json` as the canonical importer source for the next data migration slice, with `image_refs[]`, `sub_answers[]`, and extracted asset directories supported by the importer.
- Reason: The improved extraction pipeline reports zero validation errors, no review queue items, passing language quality gates, complete sq4 sub-answer alignment, and resolves all referenced assets locally.
- Impact: Importer defaults point to `test_material/data`; question documents preserve backward-compatible `image_ref` while adding canonical `image_refs[]` and `image_storage_paths[]`. UI/admin work must follow to fully expose the richer data.

### 2026-05-20 - Single-Prompt Open Questions Are Valid Practice Items

- Status: `accepted`
- Decision: Open-text questions without `sub_questions` are treated as valid single-prompt questions. If the user provides answer text, the question scores as complete for current self-grading flows.
- Reason: The improved extracted dataset intentionally includes open navigation questions with no sub-question breakdown, and blocking or always-zero scoring would make valid records unusable in practice.
- Impact: Import validation warns rather than errors for missing `sub_questions`; practice scoring handles empty `sub_questions` as single-prompt completion. Future UX may add explicit self-grade controls for these records.

### 2026-05-20 - Imported Sub-Question IDs Are Order-Normalized

- Status: `accepted`
- Decision: During import normalization, `sub_questions[]` and aligned `sub_answers[]` get stable lowercase Latin IDs by order.
- Reason: Some extracted records contain duplicate source labels/IDs, but app self-grading stores checkbox state by sub-question ID and requires unique keys.
- Impact: UI displays normalized labels for imported sub-questions; sub-answer alignment is preserved by index. Source provenance remains available on the full question record.

### 2026-05-20 - Positioning Diagram Is User-Visible Asset

- Status: `accepted`
- Decision: Questions with `references_sq11_positioning_diagram` render the shared `test_material/data/assets/position_diagram.png` asset in practice and review surfaces.
- Reason: These questions depend on a common positioning diagram; keeping the flag as provenance-only would make the question incomplete for users.
- Impact: Import asset planning includes `position_diagram.png` and uploads it to `question-assets/position_diagram.png`. The question document keeps the boolean metadata instead of duplicating the shared diagram in each `image_refs[]` list.

### 2026-06-05 - Page Routes Own Orchestration, Route Components Own UI

- Status: `accepted`
- Decision: Oversized App Router page files should keep route-level state, effects, and side-effect wiring, while substantial rendering sections move into route-local `_components` folders. Pure draft/row shaping belongs in the matching feature domain.
- Reason: `app/practice/page.js` and `app/admin/page.js` had grown past 500 lines by mixing workflow state, fetch/persistence behavior, and large JSX sections, making review and future refactors harder.
- Impact: Practice setup/active/review/navigation UI now lives under `app/practice/_components`; admin search/editor UI lives under `app/admin/_components`; admin question draft helpers live in `src/features/admin/question-draft.js`. Future page work should preserve thin route orchestrators and avoid re-growing page files with large JSX blocks.
