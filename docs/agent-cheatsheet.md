# Agent Cheat Sheet

Last updated: 2026-02-15

## Use These Files

- Strategy: `docs/product-plan.md`
- Current build scope: `docs/mvp-plan.md`
- Decisions/tradeoffs: `docs/decision-log.md`
- Full guide: `docs/agent-workflow-guide.md`

## 30-Second Workflow

1. Point agent to source of truth (`docs/mvp-plan.md` for build tasks).
2. Define scope and non-goals.
3. Ask for implementation + tests + doc updates.
4. Ask for findings first in reviews (severity + file refs).
5. Log new decisions in `docs/decision-log.md`.

## Prompt Snippets

### Build

`Use docs/mvp-plan.md as source of truth. Implement Phase X only. Keep out-of-scope untouched. Run tests and summarize results with file references.`

### Review

`Review latest commit. Focus on regressions, security risks, and missing tests. Findings first, ordered by severity, with file references.`

### Blockers

`List only blockers preventing implementation now. For each blocker, propose a default decision and tradeoff.`

### Release

`Use staging/prod checklists in docs/mvp-plan.md. Report done, missing, risks, and rollback readiness.`

## Session Checklist

### Before

- [ ] Confirm source-of-truth file
- [ ] Confirm acceptance criteria
- [ ] Confirm out-of-scope items

### During

- [ ] Keep work scoped to requested phase
- [ ] Resolve only real blockers
- [ ] Update docs when behavior/scope changes

### After

- [ ] Run tests (or state what was not run)
- [ ] Summarize changes with file paths
- [ ] Update decision log for new decisions

## Default Done Criteria

- Requested scope implemented
- Tests passed (or clearly explained failures)
- Docs updated (`mvp-plan` + decision log when needed)
- Summary is clear enough for review without opening terminal output
