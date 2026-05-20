# Seamanship Exam App - Product Plan

Last updated: 2026-02-18  
Owner: Bar Amit

## Purpose

This document is the long-term product plan and source of truth for overall scope, product behavior, and architecture direction.

Related:

- MVP execution plan: `docs/mvp-plan.md`
- Decision history: `docs/decision-log.md`
- Refactor roadmap: `docs/refactor-plan.md`

## Goal and Purpose

The app helps users prepare for the Israeli seamanship exam through:

- Practice questions
- Study materials
- Explanations
- External references and links

## User Activities

### Practice Tests

- Users can start a random practice test.
- Tests can be timed or untimed.
- Users can choose 5, 10, or 20 questions.
- At the end, users review their answers and receive feedback.
- Review includes correct answers and explanations.

### Practice by Tags

- Users can practice questions by one or more tags.
- For each question, the user can answer or skip.
- After answering or skipping, the question is shown in review mode.
- Users can continue to the next question.

### Collections

- While reviewing, users can add a question to an existing collection or create a new one.
- Each collection has a unique name and an optional short description.
- Users can practice a collection similarly to tag-based practice.

## Admin Activities

- Add and remove tags
- Edit question text
- Edit answer text
- Add and edit explanations
- Add related material to tags
- Edit, add, remove, and reorder Navigation A sub-questions

## Review Mode

Review mode should show:

- User answer (if provided)
- Correct answer
- Tags related to the question
- Explanation of why the answer is correct
- Additional relevant material linked to the question and tags

## Domain and Content

Current data status:

- Questions and answers were extracted from an e-government website.
- Some content has spelling issues, missing details, and formatting problems.
- Explanations and full study material are not yet available.
- Study material will be added later as article content.
- Additional material will be available as external links.

Source data location:

- `test_material/data/questions-all.json` (canonical)
- `test_material/data/questions-sq3.json`
- `test_material/data/questions-sq4.json`
- `test_material/data/questions-sq5.json`
- `test_material/data/questions-sq6.json`
- `test_material/data/assets/`

Subject scope:

- Everything relevant to `משיט 30` in the syllabus.

### Navigation

- Two chapters: Navigation A and Navigation B.
- Navigation A uses open-text answers and user self-evaluation.
- Navigation B uses standard multiple-choice questions.
- Navigation A can include section-based sub-questions (`sub_questions`).
- Navigation A multi-section questions render each section with its own answer field, self-grade control, and optional aligned model answer from `sub_answers[]`.

### Mechanics

- Boat mechanics, multiple-choice questions.

### Seamanship

- Sailing rules and conventions, multiple-choice questions.
- Some questions include one or more images via `image_refs[]`.
- Some answer choices include image assets via `choices[].image_ref`.
- `references_sq11_positioning_diagram` marks questions that refer to sq11 positioning-diagram material.

## Technical Requirements

### Language and RTL

- Hebrew-first UI and content.
- Full RTL layout and typography support.
- Some units and technical terms may remain in English.

### Platform

- Mobile-first UX.
- Desktop remains fully usable.
- Admin surfaces are desktop-only.

### Stack

- Node.js ecosystem
- Next.js frontend
- Firebase Auth, Firestore, Storage

### Authentication

- Google sign-in
- Admin access via email allowlist

### Quality, Security, and Compliance

- Production-grade test and security posture from start.
- Unit, integration, and end-to-end testing required.
- MVP legal baseline: privacy/terms pages and consent placeholder.
- Full GDPR/CCPA operational workflows are post-MVP.

## Finalized Product Decisions

1. Non-admin users can practice anonymously.
2. Authentication is required only for saved features (collections/progress).
3. Tags are flat.
4. Collections are private per user.
5. Question selection prioritizes least recently seen questions first.
6. Timed mode default is 6 minutes per question, user-customizable.
7. Skipped questions are revisitable in-session via question navigator UI.
8. Explanations are shown only in review mode after an answer attempt.
9. Navigation A self-grading is accepted as normal grading in score history.
10. Dashboard MVP includes per-tag accuracy; streaks/completion trends are post-MVP.
11. Base font starts with `Noto Sans Hebrew`.
12. Navigation A sub-question IDs are stored in lowercase Latin (`a`, `b`, `c`, `d`) and displayed with Hebrew labels (`א`, `ב`, `ג`, `ד`).
13. Navigation A uses equal-weight partial section scoring:
- `question_score_percent = (successful_sub_question_answers / sub_questions_amount) * 100`.
14. In final test scoring, each question has equal overall weight regardless of sub-question count.

## Post-MVP Direction

- Enhanced dashboard (streaks and completion trends)
- Full content version history and audit trail
- Advanced question weighting models
- AI-assisted Navigation A answer evaluation
- Full GDPR/CCPA data lifecycle mechanics
