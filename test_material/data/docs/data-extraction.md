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
- `data/reports/language-quality-report.json`
- `data/reports/sq4-subanswer-report.json`
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

To scaffold override files from the current review queue (optional):

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

Source errata can be applied for known source-book answer mistakes via:

- `data/reference/answer-errata.json`
- precedence: source errata overrides extracted answers (and can override sq6 CSV where explicitly defined)

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
- `image_refs[]`
- `sub_questions[]`
- `sub_answers[]` (for open questions)
- `created_at`
- `updated_at`
- `updated_by`

`sub_questions[]` are normalized to lowercase Latin IDs (`a,b,c,d`) and keep Hebrew label in `label`.

Additional provenance fields are included for traceability:

- `source_pdf`
- `source_file`
- `source_question_number`

For open questions (`sq4`), `model_answer` is included from extracted answer blocks.
For `sq4`, `sub_answers[]` is derived from `model_answer` so each sub-question has a corresponding answer slot.
For rare image-option MCQ, `choices[]` may include optional `image_ref`.
`image_refs[]` is the canonical question-level image field. `image_ref` is retained for backward compatibility.

## Review queue policy

Current default mode is fully automated:

- Manual override application is disabled by default.
- Review queue output is produced in disabled mode unless explicitly enabled.
- Pipeline quality is gated by validation + language-quality reports.

## OCR fallback behavior (sq6)

- OCR hints are applied only when answer is missing and OCR produced a single unambiguous letter.
- Applied autofills are listed in `data/reports/ocr-autofill-report.json`.
- Any unresolved records are reflected in validation and language quality reports.

## Language quality evaluation

`build_data.py` now generates `data/reports/language-quality-report.json` with:

- `spelling_issues_count`
- `grammar_issues_count`
- `coherence_score`
- `quality_status` (`pass` / `warn` / `fail`)

## Known limitations

- `sq6` answer page text layer is lossy; automated extraction may miss many answers.
- Some MCQ records in `sq3/sq5/sq6` have option text corruption from PDF text extraction.
- `sq4` has complex mixed formatting; some prompts/sub-question boundaries remain imperfect.

Use `validation-report.json` + `language-quality-report.json` + `summary.json` as the import gate before Firebase import.
