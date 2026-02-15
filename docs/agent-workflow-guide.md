# Working With Coding Agents - Quick Guide

Last updated: 2026-02-15  
Owner: Bar Amit

## Why This Exists

This guide is a practical reference for running coding-agent sessions effectively and keeping project documentation clean.

## What Each File Is For

- `docs/product-plan.md`
- Long-term product direction.
- Stable requirements and domain rules.
- Changes infrequently.

- `docs/mvp-plan.md`
- Current milestone execution plan.
- In-scope/out-of-scope, delivery phases, checklists.
- Changes frequently during active delivery.

- `docs/decision-log.md`
- History of key decisions and tradeoffs.
- Each entry includes decision, reason, impact, and status.
- Update whenever a meaningful decision is made.

- `project.md`
- Archived pointer only.
- Do not use as source of truth.

- `README.md`
- Entry point and links to all key docs.

## Standard Workflow Per Session

1. Start by giving the agent context
- Reference the exact file to use (`docs/mvp-plan.md` for implementation tasks).
- State the goal and constraints (time, scope, quality level).

2. Ask for execution, not only ideas
- Example: "Implement Phase 2 in `docs/mvp-plan.md` and run tests."

3. Require output artifacts
- Code changes
- Updated docs
- Test results summary
- List of assumptions/blockers

4. Close each session with a log update
- Add/adjust entries in `docs/decision-log.md`.
- Update `Last updated` in plan files if scope changed.

## Best Practices

- Keep one source of truth per concern.
- Product strategy in `product-plan`; current work in `mvp-plan`.

- Always define scope boundaries.
- Maintain explicit `In Scope` and `Out of Scope` lists.

- Convert open questions into decisions quickly.
- Unresolved ambiguity slows implementation and increases rework.

- Ask for acceptance criteria before coding.
- Agents perform better when "done" is measurable.

- Prefer small, verifiable increments.
- Request phases/tasks that can be tested in one pass.

- Require line-level review feedback.
- Ask for findings ordered by severity with file references.

- Track tradeoffs explicitly.
- If a shortcut is taken for MVP, log it in `decision-log.md`.

## Prompt Templates

### 1. Start Implementation

`Use docs/mvp-plan.md as the source of truth. Implement Phase X only. Keep out-of-scope items untouched. Run tests and summarize results with file references.`

### 2. Request Review

`Review my latest commit. Focus on regressions, security risks, and missing tests. Give findings first with severity and file references.`

### 3. Resolve Ambiguity

`List only blockers that prevent implementation right now. For each blocker, propose a default decision and its tradeoff.`

### 4. Release Preparation

`Use the staging/production checklists in docs/mvp-plan.md. Report what is done, what is missing, and release risks.`

## Session Procedures

### Before Coding

- Confirm source-of-truth file.
- Confirm acceptance criteria.
- Confirm non-goals.

### During Coding

- Keep changes scoped to the requested phase.
- Ask for decisions only when truly blocking.
- Update docs when behavior or scope changes.

### After Coding

- Run tests (or state exactly what was not run).
- Provide concise change summary with file paths.
- Add/update decision-log entries for new decisions.

## Common Failure Modes (And Fixes)

- Failure: scope creep into post-MVP work
- Fix: restate `Out of Scope` in the prompt and require phase-only delivery.

- Failure: docs and code diverge
- Fix: require doc updates in same task and review diffs before commit.

- Failure: repeated debates on old decisions
- Fix: point to `docs/decision-log.md` and mark superseded entries explicitly.

- Failure: vague "done" state
- Fix: require acceptance checklist and test evidence.

## Definition of Done (Default)

A task is done when:

- Code is implemented for the requested scope.
- Relevant tests pass (or failures are clearly explained).
- `docs/mvp-plan.md` is updated if scope/behavior changed.
- `docs/decision-log.md` records any new decisions.
- Reviewer can understand changes from the summary alone.
