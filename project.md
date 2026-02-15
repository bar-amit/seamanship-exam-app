# Seamanship Exam App

This document defines the product scope for a mobile-first web app for Israeli seamanship exam preparation.

## Goal and Purpose

The app helps users prepare for the Israeli seamanship exam through:

- Practice questions
- Study materials
- Explanations
- External references and links

## User Activities

Users study and practice with a personalized flow.

### 1. Practice Tests

- Users can start a random practice test.
- Tests can be timed or untimed.
- Users can choose 5, 10, or 20 questions.
- At the end, users review their answers and receive feedback.
- Review includes correct answers and explanations.

### 2. Practice by Tags

- Users can practice questions by one or more tags.
- For each question, the user can answer or skip.
- After answering/skipping, the question is shown in review mode.
- Users can continue to the next question.

### 3. Collections

- While reviewing, users can add a question to an existing collection or create a new one.
- Each collection has a unique name and an optional short description.
- Users can practice a collection similarly to tag-based practice.

## Admin Activities

A personal admin account should have management capabilities:

- Add/remove tags
- Edit question text
- Edit answer text
- Add/edit explanations
- Add related material to tags

## Review Mode

In review mode, the app should show:

- User answer (if provided)
- Correct answer
- Tags related to the question
- Explanation of why the answer is correct
- Additional relevant material linked to the question/tags

## Existing Material

Current data status:

- Questions and answers were extracted from an e-government website.
- Some content has spelling issues, missing details, and formatting problems.
- Explanations and full study material are not yet available.
- Study material will be added later as article content.
- Additional material will also be available as external links.

All relevant source files are currently in `test_material`.

A breakdown of subjects/sub-subjects exists in the syllabus. In future phases, the syllabus will be translated and mapped directly in the app. For now, scope includes all content relevant to `משיט 30`.

### Navigation

- Includes two chapters: Navigation A and Navigation B.
- Navigation A focuses on calculations and map usage.
- Navigation A questions are open-ended.
- Since no map resource is currently available, Navigation A answers should be self-evaluated by the user during review.
- Users type free-text answers and grade themselves in review mode.
- In a future version, answer evaluation may be automated (for example, AI-assisted scoring).
- Navigation B uses standard multiple-choice questions.
- Topics: Navigation A covers map navigation; Navigation B covers instrument navigation.

### Mechanics

- Boat mechanics.
- Multiple-choice questions.

### Seamanship

- Sailing at sea, including rules and conventions.
- Multiple-choice questions.
- Some questions include images from the `images` folder.
- Each image has a description.
- Image descriptions should appear in review mode only, not while answering.

## Technical Requirements

### 1. Language and RTL
- UI and most content are in Hebrew.
- Layout, typography, and alignment must be optimized for right-to-left (RTL).
- Some units and technical terms may remain in English.

### 2. Mobile-First
- Primary UX target is mobile.
- Desktop UX should still be fully usable.
- Admin features are desktop-only.

### 3. Testing and Security
- The app should be production-ready.
- Testing and security must be addressed from the beginning.
- Unit tests are required.

### 4. Development Stack
- Node.js ecosystem.
- Frontend: Next.js.
- Database/backend services: Firebase.

### 5. Authentication
- Google sign-in.

## Planning Decisions

### 1. Users and Roles
- Will non-admin users need their own accounts, or is this initially a single-user app plus one admin?
  - Decision: Non-admin users can practice anonymously. Authentication is required only for features that save data (for example, collections and progress history).

- Should admin capabilities be controlled by email allowlist, custom claims, or both?
  - Decision: Admin access is controlled by an email allowlist.

### 2. Content Model
- What is the exact question schema (single correct answer, multiple correct answers, free text, media attachments)?
  - Decision: Most questions are multiple-choice with a single correct answer. Navigation A questions are free-text and self-evaluated.

- Should tags be hierarchical, flat, or both?
  - Decision: Tags are flat.
- Should collections be private per user, or shared globally?
  - Decision: Collections are private per user.

### 3. Test Behavior
- How should randomization work: fully random, weighted by weak areas, or by recency?
  - Decision: Question selection is weighted by recency.

- For timed tests, what are the default durations for 5/10/20-question tests?
  - Decision: Default timing is 6 minutes per question, customizable by the user.

- Should skipped questions be re-queued in the same session?
  - Decision: Users can navigate back to skipped questions in the same session.
  - UX note: Add a compact question navigator (colored status indicators per question: unanswered, answered, skipped/current).

### 4. Review and Scoring
- What score format is needed (percentage, pass/fail threshold, raw score)?
  - Decision: Score format is percentage with equal weight per question.

- Should users see explanations immediately after each question, only at the end, or both?
  - Decision: Explanations are shown only in review mode after the user attempts an answer.

- For self-evaluated Navigation A questions, how should self-grading affect score history?
  - Decision: Self-evaluated grades are treated like regular grades in score history.
  - Product policy: The app is built for self-learning; self-grading integrity is user-responsibility.

### 5. Progress and Analytics
- Should the app track per-tag performance trends over time?
  - Decision: Yes.

- Do you need a dashboard for weak topics, streaks, and completion progress?
  - Decision: Yes.

### 6. Study Materials
- What is the minimum metadata for articles and external links (title, source, tags, language, last updated)?
  - Decision: Required metadata is `title`, `source`, `tags`, `language`, and `last_updated`.

- Should links open in-app or in a new browser tab?
  - Decision: External links open in a new browser tab.

### 7. Content Workflow
- Do you want an import pipeline (CSV/JSON) for questions, or manual admin entry only?
  - Decision: Import pipeline from local JSON files in `test_material/questions` and `test_material/answers`.

- Should content edits be versioned/audited?
  - Recommendation: Keep MVP simple.
  - Decision proposal: Add only basic audit fields (`created_at`, `updated_at`, `updated_by`) without full version history. Full versioning can be added later.

### 8. Images and Assets
- Where are images stored now, and should they move to Firebase Storage?
  - Decision: Source images are in `test_material/test_images/images`. Production assets should be uploaded to Firebase Storage.

- Do you need image optimization (size limits, lazy loading, responsive variants)?
  - Decision: Yes.

### 9. Localization and Typography
- Do you want full RTL-only UI now, or bilingual support (Hebrew/English) later?
  - Decision: Hebrew-only for MVP (RTL-first).

- Any preferred Hebrew fonts and accessibility standards?
  - Decision: No fixed font yet. Font/accessibility standards will be selected during design and documented in the UI spec.

### 10. Compliance and Operations
- Are there privacy/legal requirements (for example, storing user activity or analytics consent)?
  - Requirement: Follow a high standard aligned with EU and US privacy/security expectations.

- Which environments are needed (`dev`, `staging`, `prod`) and who deploys?
  - Decision: Build `dev` now.
  - Plan: Add `staging` and `prod` environment design in this planning phase.

### 11. Quality and Delivery
- What testing depth is expected initially: unit only, or unit + integration + end-to-end?
  - Decision: Full depth for MVP: unit, integration, and end-to-end tests.

- What is the target MVP date and the must-have features for that milestone?
  - Target: A running website by Thursday.
  - Scope policy: Today is planning only. Build starts after plan approval.

## Improved Implementation Plan

### MVP Scope (Must-Have by Thursday)

- Public practice mode without login.
- Google sign-in for saved user data.
- Admin-only edit tools protected by email allowlist.
- Import pipeline from local JSON question/answer files.
- Core practice flows include random practice tests (5/10/20, timed or untimed), tag-based practice, and Navigation A free-text answers with self-grading in review.
- Review mode with correct answer, explanation, tags, and related material.
- Private user collections.
- Basic progress tracking and per-tag performance.
- Mobile-first RTL Hebrew UI.

### Post-MVP Scope (Planned Next)

- Weak-topic dashboard enhancements (streaks, deeper analytics).
- Full content version history and audit trail.
- Advanced recency/knowledge weighting models.
- AI-assisted free-text evaluation for Navigation A.

### Proposed Technical Design

#### Frontend

- Next.js (App Router) with RTL-first design.
- Authentication-aware routing for public practice routes, protected user routes, and admin route groups secured by allowlist middleware.
- Session state should include current question index, per-question answers, skip state, and a navigator model for quick jumping.

#### Backend and Data

- Firebase Auth (Google provider).
- Firestore as primary app database.
- Firebase Storage for question images and media.
- Cloud Functions (or server actions + Admin SDK) should handle data import jobs and enforce admin-only mutation validation.

#### Content/Data Model (Draft)

- `questions`: `id`, `subject`, `chapter`, `type` (`mcq` | `free_text`), `text`, `choices[]`, `correct_choice_id`, `tags[]`, `image_ref`, `sub_questions[]`, `created_at`, `updated_at`, `updated_by`
  - `sub_questions[]` is used for section-based free-text questions (Navigation A).
  - Each `sub_questions[]` item: `id`, `label`, `text`, `order`.
  - `id` is a stable identifier (for example, `a`, `b`, `c`, `d`) used in grading records.
- `explanations`: `question_id`, `text`, `last_updated`
- `materials`: `id`, `title`, `source`, `url`, `tags[]`, `language`, `last_updated`
- `users`: `uid`, `email`, `display_name`, `role` (`user` | `admin`)
- `collections`: `id`, `owner_uid`, `name`, `description`, `question_ids[]`, `created_at`, `updated_at`
- `attempts`: `id`, `uid` (nullable for anonymous), `mode`, `question_ids[]`, `answers[]`, `score_percent`, `self_graded_flags[]`, `sub_question_grades[]`, `created_at`
  - `sub_question_grades[]` stores section-level self-grading for Navigation A.
  - Each item: `question_id`, `sub_question_id`, `is_correct` (boolean).
- `tag_stats`: `uid`, `tag`, `correct_count`, `attempt_count`, `last_attempt_at`

### Test Strategy

- Unit tests: scoring logic, timer logic, randomization weighting, and import utilities.
- Integration tests: Firestore operations, auth guards, and admin allowlist checks.
- End-to-end tests: anonymous practice flow, signed-in collection flow, admin edit flow, and review flow.

### Security Baseline

- Firestore and Storage security rules with least privilege.
- Admin operations validated server-side (never client-only checks).
- Input validation and sanitization on imported content.
- Basic privacy controls include cookie/consent notices and placeholders for privacy policy and terms pending legal review.

### Environment Plan

- `dev`: local and shared development environment.
- `staging`: production-like environment for UAT and pre-release testing.
- `prod`: public deployment with strict keys, monitoring, and backups.
- Environment separation includes independent Firebase projects and service accounts.

### Delivery Plan

#### Phase 1: Planning and Data Contract
- Finalize schema and import mapping.
- Freeze MVP feature list.

#### Phase 2: Foundations
- Bootstrap Next.js + Firebase.
- Configure RTL, auth, and route protection.

#### Phase 3: Core Learning Flows
- Build practice, review, and collection features.
- Implement timing and navigation UI.

#### Phase 4: Admin and Import
- Build admin edit surfaces.
- Run data import and validation.

#### Phase 5: Quality and Release
- Execute unit/integration/e2e test suites.
- Deploy to `dev`, then prepare `staging` and `prod` configs.

## Finalized Decisions

1. Admin identity
- `dev` admin allowlist includes: `bosh44@gmail.com`.

2. Legal/privacy scope
- MVP uses a simple legal baseline (privacy and terms pages + consent placeholder).
- Full GDPR/CCPA workflows (data export/deletion lifecycle) move to post-MVP.

3. Recency model
- Keep the model simple: prioritize least recently seen questions first.

4. Anonymous progress
- Persist anonymous progress in local storage.

5. Navigation A scoring and schema
- Self-grading is binary (`correct`/`incorrect`).
- Navigation A questions can be section-based.
- Schema update required for free-text questions to include section definitions.
- Source reference for mapping: `test_material/questions/navigation_A_quesitons.json` using `sub_questions`.

6. Image metadata mapping
- Question JSON `asset` field stores the image key (for example, `image_36`).
- `test_material/test_images` contains image metadata JSON (filename + description).
- `test_material/test_images/images/` contains image binaries.
- Decision: store image metadata directly on each question document at import time (denormalized), while files are stored in Firebase Storage.

7. Dashboard MVP
- Include per-tag accuracy only in MVP.
- Streaks and completion trends are post-MVP.

8. Font baseline
- Start with `Noto Sans Hebrew`.

## Finalized Sub-Question Decisions

1. Sub-question identifiers
- Do you want stored IDs as Latin (`a`, `b`, `c`, `d`) and UI labels in Hebrew (`א`, `ב`, `ג`, `ד`), or should IDs also be Hebrew?
    - Normalize to latin IDs (even if current is Hebrew), Hebrew UI.

2. Section score calculation
- For Navigation A, should each sub-question have equal weight in the total question score?
    - Yes.

3. Optional partial grading
- If a Navigation A question has 4 sections and the user marks 3 correct, should that question count as `75%` for scoring, or only `correct/incorrect` at whole-question level?
    - Do partial grading for these questions with equal section weights.
    - Navigation A formula: `question_score_percent = (successful_sub_question_answers / sub_questions_amount) * 100`.
    - Each question still has equal overall weight in final test scoring, regardless of its number of sub-questions.

4. Admin editing constraints
- Should admins be allowed to reorder sub-questions after creation, or is order fixed from import?
    - Allow reorder.

## Staging and Deployment Plan

### Deployment Topology

- Three isolated Firebase projects: `seamanship-dev`, `seamanship-staging`, `seamanship-prod`.
- One deployment target per environment (hosting + Firestore + Storage + Functions).
- Separate service accounts and `.env` files per environment.

Reasoning: hard isolation prevents accidental data leaks and lets staging mirror production safely.

### Release Flow

- `main` branch deploys to `staging` automatically after CI passes.
- `prod` deployment is manual approval from the latest staging tag/commit.
- Hotfixes go to `main`, then re-promote through `staging` before `prod`.

Reasoning: staging becomes the quality gate; production changes are deliberate and reversible.

### Staging Checklist

- [ ] Create Firebase staging project and enable Auth, Firestore, Storage.
- [ ] Configure Google Auth OAuth client for staging domain.
- [ ] Add staging environment variables (`NEXT_PUBLIC_*`, server-only keys).
- [ ] Apply Firestore indexes and security rules from version-controlled config.
- [ ] Apply Storage security rules.
- [ ] Deploy Cloud Functions / server actions config to staging.
- [ ] Seed staging with representative data import (questions, answers, image metadata, sample assets).
- [ ] Verify admin allowlist in staging config.
- [ ] Run full test suite in CI (unit + integration + e2e against staging).
- [ ] Run smoke tests manually on mobile and desktop (RTL layout, login, practice flow, review flow, admin edits).
- [ ] Validate performance budget basics (page load, image lazy loading).
- [ ] Validate error tracking/logging is enabled.

Reasoning: staging must be production-like, with realistic data and complete verification before promotion.

### Production Deployment Checklist

- [ ] Confirm staging build commit hash and tag release.
- [ ] Verify production Firebase project exists with least-privilege IAM.
- [ ] Configure production OAuth consent screen/domain and callback URLs.
- [ ] Set production environment variables and rotate secrets if needed.
- [ ] Deploy rules first (Firestore/Storage), then Functions, then Hosting.
- [ ] Run migration/import scripts in production-safe mode (idempotent checks enabled).
- [ ] Execute post-deploy smoke tests (auth, question load, answer submit, review, admin route access control).
- [ ] Confirm monitoring/alerts are active (error rate, function failures, auth failures).
- [ ] Confirm backup/restore plan for Firestore and Storage is enabled.
- [ ] Announce release notes and keep rollback reference (previous deployment version).

Reasoning: ordered deploy + smoke tests + rollback anchor minimizes outage risk.

### Rollback Checklist

- [ ] Keep previous Hosting release available for instant rollback.
- [ ] Revert Functions to previous version if server logic causes regressions.
- [ ] If data migration caused issues, stop writes, restore from backup snapshot, and redeploy prior code.
- [ ] Re-run smoke tests after rollback.

Reasoning: rollback must restore both code and data integrity, not only UI artifacts.

### Environment Ownership

- `dev`: rapid iteration, local + shared testing, relaxed data requirements.
- `staging`: release candidate validation, strict parity with production config.
- `prod`: stable public environment with change control and monitoring.

Reasoning: each environment has a single purpose, which reduces confusion and release risk.
