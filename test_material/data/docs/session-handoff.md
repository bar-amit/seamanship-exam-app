# Session Handoff

Last updated: 2026-02-18

## Current Status

- Phase 2 data remediation is complete.
- Build output is clean:
  - `validation_errors = 0`
  - `review_queue_items = 0`
- Authoritative generated data is in `data/`.
- Existing legacy data in `questions/` and `answers/` was not modified.

## Key Decisions Implemented

- Source of truth remains PDF files.
- All newly generated/normalized data is written under `data/`.
- `sq6-answers.csv` is authoritative for `sq6` answers in range `1..176`.
- `sq4` question `96` is skipped (`skip_question=true`) due to source issue.
- `sq4` intentional no-sub-question cases are supported (`accept_missing_sub_questions=true`).
- `sq5` questions `102-103` support image-based options via `image_ref` metadata.

## Known Follow-up (Not Blocking)

- Investigate missing `sq6` questions `177-178`:
  - Could be parser limitation.
  - Could be source PDF issue.
  - Tracked in `docs/data-edge-cases.md`.

## Reproducible Workflow

1. Re-extract raw artifacts:

```bash
bash scripts/extract_to_data_raw.sh
```

2. Build normalized data + reports:

```bash
python3 scripts/build_data.py
```

3. Check gate reports:

```bash
cat data/reports/summary.json
cat data/reports/validation-report.json
cat data/reports/review-queue.json
```

Expected clean gate:
- `validation_errors: 0`
- `review_queue_items: 0`

## Manual Review/Override UI

Serve from repo root (recommended):

```bash
python3 -m http.server 8000
```

Open:
- `http://localhost:8000/overrides.html`

Notes:
- UI now shows queue-only items from `data/reports/review-queue.json`.
- If browser behaves stale, do hard refresh.

## Important Paths

- Final merged dataset: `data/questions-all.json`
- Per-source datasets:
  - `data/questions-sq3.json`
  - `data/questions-sq4.json`
  - `data/questions-sq5.json`
  - `data/questions-sq6.json`
- Reports:
  - `data/reports/summary.json`
  - `data/reports/validation-report.json`
  - `data/reports/review-queue.json`
  - `data/reports/sq6-csv-report.json`
- Edge cases doc: `docs/data-edge-cases.md`
- Extraction doc: `docs/data-extraction.md`
- Remediation doc: `docs/data-remediation.md`

## Suggested Next Start Command

When you return, run:

```bash
python3 scripts/build_data.py && cat data/reports/summary.json
```

If summary remains clean, continue directly with MVP Phase 2 app implementation.
