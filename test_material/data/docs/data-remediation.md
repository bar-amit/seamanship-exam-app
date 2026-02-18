# Data Remediation Workflow

Last updated: 2026-02-18

## Goal

Close all blockers in `data/reports/review-queue.json` so `data/questions-all.json` is import-ready for MVP Phase 2.

## Workflow

1. Run extraction/build pipeline.
2. Open `data/reports/review-queue.json`.
3. Check `data/reports/ocr-autofill-report.json` and spot-review autofilled `sq6` answers.
4. For special cases, apply rules from `docs/data-edge-cases.md`.
5. Resolve issues by source in this order:
   1. `sq6` missing answers (highest impact)
   2. `sq5` missing MCQ options
   3. `sq3` missing MCQ options/answers
   4. `sq4` malformed open-question splits
6. Re-run `python3 scripts/build_data.py` after each correction batch.
7. Stop only when validation errors are 0 or explicitly accepted with documented exceptions.

## Recommended remediation artifacts

Store manual corrections in explicit override files:

- `data/overrides/sq3.overrides.json`
- `data/overrides/sq4.overrides.json`
- `data/overrides/sq5.overrides.json`
- `data/overrides/sq6.overrides.json`

Generate stubs from current queue:

```bash
python3 scripts/generate_override_stubs.py
```

Apply overrides by rebuilding:

```bash
python3 scripts/build_data.py
```

Inspect override application status:

- `data/reports/overrides-report.json`

## Supported override flags

- `set.accept_missing_sub_questions = true`
  - Accept intentional no-sub-question open items.
- `set.skip_question = true`
  - Exclude source-broken question from output/queue/validation.

Current status note:

- `sq4-q096` is already excluded from the current canonical output datasets.

Each override should include:

- source question number
- changed fields
- reason
- reviewer
- date

This keeps a clean audit trail and allows deterministic rebuilds.
