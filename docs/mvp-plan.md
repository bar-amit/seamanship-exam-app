# Seamanship Exam App - MVP Plan

Last updated: 2026-02-18  
Owner: Bar Amit
Target launch: Thursday, 2026-02-19

## Purpose

This document is the execution plan for the MVP only. It defines what must be built now, what is explicitly out of scope, and how release is validated.

Related:

- Long-term product plan: `docs/product-plan.md`
- Decision history: `docs/decision-log.md`

## In Scope (MVP)

- Public practice mode without login
- Google sign-in for saved user data
- Admin-only edit tools protected by allowlist
- Import pipeline from local JSON files
- Random practice tests (5/10/20 questions, timed or untimed)
- Tag-based practice mode
- Navigation A open-text answers with section-based self-grading
- Review mode with answers, explanations, tags, and related material
- Private user collections
- Basic progress tracking with per-tag accuracy
- Mobile-first Hebrew RTL UI

## Out of Scope (MVP)

- Streaks and completion-trend analytics
- Full content version history
- AI-assisted free-text evaluation
- Full GDPR/CCPA data export and deletion operations

## Core Data Contract (MVP)

- `questions`: `id`, `subject`, `chapter`, `type`, `text`, `choices[]`, `correct_choice_id`, `tags[]`, `image_ref`, `sub_questions[]`, `created_at`, `updated_at`, `updated_by`
- `type` values used by current dataset: `mcq`, `open_text`
- `sub_questions[]` item: `id`, `label`, `text`, `order`
- Import rule: normalize `sub_questions[].id` to lowercase Latin (`a`, `b`, `c`, `d`)
- UI rule: render Hebrew labels (`א`, `ב`, `ג`, `ד`) via `label`
- Tag baseline rule for MVP: every question gets a default chapter tag (`seamanship`, `navigation a`, `navigation b`, `mechanics`)
- `sq4-q096` is excluded from import (repeated/source-broken question)
- `sq5-q102` and `sq5-q103` use per-choice image refs from `test_material/data/assets/sq5-option-images.json`
- Temporary asset dual-source note: importer currently reads from both `test_material/data/assets` and `test_material/test_images/images` (sq3 legacy). Post-MVP task: consolidate to one canonical assets source.
- `attempts`: `id`, `uid` (nullable), `mode`, `question_ids[]`, `answers[]`, `self_graded_flags[]`, `sub_question_grades[]`, `score_percent`, `created_at`
- `sub_question_grades[]` item: `question_id`, `sub_question_id`, `is_correct`

Scoring rules:

- Navigation A question score:
- `question_score_percent = (successful_sub_question_answers / sub_questions_amount) * 100`
- Final test scoring keeps equal overall weight per question.

## Implementation Plan

### Phase 1: Foundations

- Bootstrap Next.js + Firebase
- Configure auth and admin allowlist
- Configure RTL, typography baseline, and route guards

### Phase 2: Data and Import

- Build importer from normalized data files under `test_material/data`
- Join image-option metadata from `test_material/data/assets/sq5-option-images.json`
- Upload image assets to Firebase Storage
- Denormalize image metadata into question documents and choice records

### Phase 3: Core Flows

- Build practice test flow
- Build tag practice flow
- Build review flow
- Build in-session question navigator for answered/skipped navigation

### Phase 4: Saved Features and Admin

- Build collections (private per user)
- Build per-tag progress tracking
- Build admin editing for questions, explanations, tags, and sub-questions

### Phase 5: Quality and Release

- Run unit, integration, and end-to-end suites
- Deploy and validate in `dev`
- Promote to `staging` after CI and smoke pass
- Manually promote to `prod`

## Test Requirements

- Unit tests for scoring, recency weighting, timer behavior, and import parsing
- Unit tests for mixed Navigation A section counts (for example, 2 vs 4 sub-questions) to verify equal per-question weighting
- Integration tests for Firestore rules, auth guards, and admin checks
- End-to-end tests for anonymous flow, authenticated collections flow, admin flow, and review flow

## Staging and Deployment

### Topology

- Isolated Firebase projects: `seamanship-dev`, `seamanship-staging`, `seamanship-prod`
- Separate service accounts and env config per environment

### Release Flow

- `main` auto-deploys to `staging` after CI pass
- `prod` deployment is manual from approved staging commit

### Staging Checklist

- [ ] Create Firebase staging project and enable Auth/Firestore/Storage
- [ ] Configure OAuth for staging domain
- [ ] Set staging environment variables and secrets
- [ ] Deploy Firestore indexes and security rules
- [ ] Deploy Storage rules
- [ ] Deploy server-side logic (Functions/server actions)
- [ ] Seed representative data via importer
- [ ] Validate allowlist config
- [ ] Run CI test suites
- [ ] Run smoke tests on mobile and desktop
- [ ] Verify logging and error tracking

### Production Checklist

- [ ] Promote approved staging commit
- [ ] Verify production IAM and OAuth settings
- [ ] Set production env vars and rotate secrets if needed
- [ ] Deploy in order: rules -> server logic -> hosting
- [ ] Run idempotent import/migrations in production-safe mode
- [ ] Run post-deploy smoke tests
- [ ] Confirm alerts and backups are active
- [ ] Keep rollback pointer to previous release

### Rollback Checklist

- [ ] Roll back Hosting to previous release
- [ ] Roll back server logic to previous version if needed
- [ ] If data issue exists, stop writes and restore backup snapshot
- [ ] Re-run smoke tests

## Open Execution Inputs

- Confirm all admin emails for non-dev environments
- Confirm staging/prod domain names
- Confirm monitoring tool choice (Sentry/Cloud Logging only/etc.)
