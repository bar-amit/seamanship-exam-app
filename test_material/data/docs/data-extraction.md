# Data Extraction and Build (Reproducible)

Last updated: 2026-02-18

This process generates **new output only** under `data/`.
Existing files under `questions/` and `answers/` are not modified.

## What this pipeline produces

- `data/questions-sq3.json`
- `data/questions-sq4.json`
- `data/questions-sq5.json`
- `data/questions-sq6.json`
- `data/questions-all.json` (canonical merged import file)
- `data/reports/validation-report.json`
- `data/reports/review-queue.json`
- `data/reports/ocr-autofill-report.json`
- `data/reports/sq6-csv-report.json`
- `data/reports/overrides-report.json`
- `data/reports/summary.json`
- raw extraction artifacts under `data/raw/`
- edge-case policy: `docs/data-edge-cases.md`

## Source-specific parsing model

- `sq3.pdf`: MCQ (`seamanship`)
- `sq4.pdf`: open/sub-question (`navigation_a`)
- `sq5.pdf`: MCQ (`navigation_b`)
- `sq6.pdf`: MCQ (`mechanics`)
- `sq11.pdf`: supporting image/description booklet

Each source has different layout and answer formats, so parsers are per-source.

## Prerequisites

- Python 3.12+
- `pdftotext`
- `pdftohtml`
- Optional: `tesseract` for future OCR pass on low-quality answer pages (not required for current run)
  - Recommended for this repo: `tesseract` with `heb` + `eng`

## Run pipeline

From repository root:

```bash
bash scripts/extract_to_data_raw.sh
python3 scripts/build_data.py
```

To scaffold override files from the current review queue:

```bash
python3 scripts/generate_override_stubs.py
```

If `tesseract` is installed, `extract_to_data_raw.sh` will also generate:

- `data/raw/answers-sq6.ocr-hints.json`

`build_data.py` uses these hints only as fallback when `sq6` answer is missing.

If `sq6-answers.csv` exists, build uses it as authoritative for `sq6` questions `1..176`:

- precedence: `sq6 CSV` > extracted answers > OCR hints
- CSV validation report: `data/reports/sq6-csv-report.json`
- reference copy: `data/reference/sq6-answers.csv`

`extract_to_data_raw.sh` also generates image-option crops for sq5 edge cases:

- `data/assets/sq5-option-images/*.jpg`
- `data/assets/sq5-option-images.json`

## Data contract mapping

Normalized output follows the MVP core contract fields:

- `id`
- `subject`
- `chapter`
- `type`
- `text`
- `choices[]`
- `correct_choice_id`
- `tags[]`
- `image_ref`
- `sub_questions[]`
- `created_at`
- `updated_at`
- `updated_by`

`sub_questions[]` are normalized to lowercase Latin IDs (`a,b,c,d`) and keep Hebrew label in `label`.

Current normalized type values:

- `mcq`
- `open_text`

Tag baseline for MVP imports:

- `tags[]` is populated with one chapter-derived tag per question:
  - `seamanship`
  - `navigation a`
  - `navigation b`
  - `mechanics`

Additional provenance fields are included for traceability:

- `source_pdf`
- `source_file`
- `source_question_number`

For open questions (`sq4`), `model_answer` is included from extracted answer blocks.
For rare image-option MCQ, `choices[]` may include optional `image_ref`.
`sq5` questions `102-103` are expected to include per-choice `image_ref` from `data/assets/sq5-option-images.json`.

## Review queue policy (answer to your item 1)

"Automated output + review queue" means:

- Pipeline does not silently fix questionable records.
- Any missing/invalid critical data is added to `data/reports/review-queue.json`.
- Manual fixes should be applied in a follow-up controlled step (with explicit audit trail).

This keeps extraction reproducible and prevents accidental source drift.

## OCR fallback behavior (sq6)

- OCR hints are applied only when answer is missing and OCR produced a single unambiguous letter.
- Applied autofills are listed in `data/reports/ocr-autofill-report.json`.
- Any unresolved records remain in `data/reports/review-queue.json`.

## Known limitations

- `sq6` answer page text layer is lossy; automated extraction may miss many answers.
- Some MCQ records in `sq3/sq5/sq6` have option text corruption from PDF text extraction.
- `sq4` has complex mixed formatting; some prompts/sub-question boundaries remain imperfect.

Use `validation-report.json` + `review-queue.json` as the mandatory gate before importing into Firebase.
