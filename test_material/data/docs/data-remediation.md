# Data Remediation Workflow

Last updated: 2026-02-28

## Goal

Keep extraction quality high in fully automated mode and reach import-ready `data/questions-all.json`.

## Workflow

1. Run extraction/build pipeline:
   - `bash scripts/extract_to_data_raw.sh`
   - `python3 scripts/build_data.py`
2. Check automated gates:
   - `data/reports/validation-report.json`
   - `data/reports/language-quality-report.json`
   - `data/reports/sq4-subanswer-report.json`
   - `data/reports/summary.json`
3. If gates fail, improve parser/normalization rules in scripts (not manual edits).
4. Re-run pipeline and compare metrics trend until gates pass.

## Source errata (always-on)

For known mistakes in source answer tables, use:

- `data/reference/answer-errata.json`

This is applied automatically by `build_data.py` (without `--use-overrides`).

## Optional manual fallback (disabled by default)

Manual overrides are optional and should be used only as last resort:

- `data/overrides/sq3.overrides.json`
- `data/overrides/sq4.overrides.json`
- `data/overrides/sq5.overrides.json`
- `data/overrides/sq6.overrides.json`

Generate stubs from queue (if queue mode is enabled):

```bash
python3 scripts/generate_override_stubs.py
```

Apply overrides by rebuilding with opt-in flag:

```bash
python3 scripts/build_data.py --use-overrides --emit-review-queue
```

Inspect override application status:

- `data/reports/overrides-report.json`

## Supported override flags

- `set.accept_missing_sub_questions = true`
  - Accept intentional no-sub-question open items.
- `set.skip_question = true`
  - Exclude source-broken question from output/queue/validation.

Each override should include:

- source question number
- changed fields
- reason
- reviewer
- date

Automated-first remains the default strategy.
