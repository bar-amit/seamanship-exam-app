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

## Open Questions for Planning

### 1. Users and Roles
- Will non-admin users need their own accounts, or is this initially a single-user app plus one admin?
    Non-admin user won't have to have an account. Only if they want to save a collection.

- Should admin capabilities be controlled by email allowlist, custom claims, or both?
    Email allow list.

### 2. Content Model
- What is the exact question schema (single correct answer, multiple correct answers, free text, media attachments)?
    For all except for Navigation A this is a multiple choice single correct answer. For Navigation A in will be
free text.

- Should tags be hierarchical, flat, or both?
    Flat.
- Should collections be private per user, or shared globally?
    Private.

### 3. Test Behavior
- How should randomization work: fully random, weighted by weak areas, or by recency?
    By recency.

- For timed tests, what are the default durations for 5/10/20-question tests?
    6 minutes per question. customizable by user.

- Should skipped questions be re-queued in the same session?
    The user should be able to go back to them. I am thinking of a small bar with colored squares where the user can see how many questions he have, which he answered and which he hasn't and navigate to them.

### 4. Review and Scoring
- What score format is needed (percentage, pass/fail threshold, raw score)?
    Percentage. Even scoring per question.

- Should users see explanations immediately after each question, only at the end, or both?
    Only in review mode after he made an attempt to answer the question.

- For self-evaluated Navigation A questions, how should self-grading affect score history?
    As a normal grade. The app should accomodate self learning. If someone is cheating it is his problem.

### 5. Progress and Analytics
- Should the app track per-tag performance trends over time?
    Yes.

- Do you need a dashboard for weak topics, streaks, and completion progress?
    Yes, it would be a good addition.

### 6. Study Materials
- What is the minimum metadata for articles and external links (title, source, tags, language, last updated)?
    Exactly what you suggest.

- Should links open in-app or in a new browser tab?
    In a new browser tab.

### 7. Content Workflow
- Do you want an import pipeline (CSV/JSON) for questions, or manual admin entry only?
    You would find JSON files in the test_material/questions and test_material/answers folder. Those should be imported to the app database.

- Should content edits be versioned/audited?
    I don't want to over think it. What do you suggest?

### 8. Images and Assets
- Where are images stored now, and should they move to Firebase Storage?
    Now they are at test_material/test_images/images folder. Yes, they should be stored online.

- Do you need image optimization (size limits, lazy loading, responsive variants)?
    Yes.

### 9. Localization and Typography
- Do you want full RTL-only UI now, or bilingual support (Hebrew/English) later?
    Only Hebrew.

- Any preferred Hebrew fonts and accessibility standards?
    I don't have any. If you can't find any yourself I would provide it, tell me.

### 10. Compliance and Operations
- Are there privacy/legal requirements (for example, storing user activity or analytics consent)?
    Go by EU and US gold legal standard

- Which environments are needed (`dev`, `staging`, `prod`) and who deploys?
    For now we implement dev and I would like you to plan the others.

### 11. Quality and Delivery
- What testing depth is expected initially: unit only, or unit + integration + end-to-end?
    Full depth. unit + integration + e2e.

- What is the target MVP date and the must-have features for that milestone?
    I want a running website by thursday. Today I only want planing. If I am happy with the plan I might start building the app today.
