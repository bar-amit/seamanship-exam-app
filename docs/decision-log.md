# Seamanship Exam App - Decision Log

Last updated: 2026-02-18  
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

- Status: `accepted`
- Decision: Prioritize least recently seen questions first.
- Reason: Keep algorithm simple and useful for revision coverage.
- Impact: Attempt history must store timestamps usable for recency sorting.

### 2026-02-15 - Timing Default

- Status: `accepted`
- Decision: Default timer is 6 minutes per question and user-customizable.
- Reason: Baseline pacing with flexibility per learner.
- Impact: Timer settings need per-test configuration and persistence rules.

### 2026-02-15 - Explanation Visibility Rule

- Status: `accepted`
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
