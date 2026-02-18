# Data Edge Cases

Last updated: 2026-02-18

This doc tracks real source-data exceptions that are not fully captured in `mvp-plan.md`.

## 1) Image-based MCQ options (sq5 q102-103)

Problem:

- Question options are diagrams/images, not text.
- OCR/text extraction yields empty or broken option text.

Handling:

- Keep question type as `mcq`.
- Store option labels and text placeholders (`"איור א"`, etc.).
- Attach per-choice image references via `choices[].image_ref` using `data/assets/sq5-option-images.json`.

Generated assets:

- `data/assets/sq5-option-images/q102-a.jpg`
- `data/assets/sq5-option-images/q102-b.jpg`
- `data/assets/sq5-option-images/q102-c.jpg`
- `data/assets/sq5-option-images/q102-d.jpg`
- `data/assets/sq5-option-images/q103-a.jpg`
- `data/assets/sq5-option-images/q103-b.jpg`
- `data/assets/sq5-option-images/q103-c.jpg`
- `data/assets/sq5-option-images/q103-d.jpg`
- Manifest: `data/assets/sq5-option-images.json`

Override representation:

```json
{
  "set": {
    "choices": {
      "a": { "text": "איור א", "image_ref": "sq5-option-images/q102-a.jpg" }
    }
  }
}
```

## 2) Open questions with intentionally no sub-questions (sq4)

Problem:

- Some `sq4` records are valid without sub-questions.
- Generic validation flags these as missing.

Handling:

- Add override flag:
  - `set.accept_missing_sub_questions = true`
- Build excludes these from queue and validation errors for `missing_sub_questions`.

## 3) Source-broken repeated question removed (sq4 q96)

Problem:

- `sq4` question 96 is a source error and should not be imported.

Handling:

- Final import-ready datasets exclude this question.
- Current canonical outputs (`questions-sq4.json`, `questions-all.json`) do not contain `sq4-q096`.

## 4) Missing open prompt default (sq4)

Problem:

- Some open questions have missing prompt but valid sub-sections.

Handling:

- UI supports one-click default prompt:
  - `ענה על הסעיפים:`
- Build fallback for unresolved missing prompt on `sq4` can use this default when issue remains flagged and prompt left empty.

## 5) sq6 answers extraction degradation

Problem:

- Source text layer for answer page is lossy.

Handling:

- OCR hint extractor (`tesseract`) fills only unambiguous number→letter mappings.
- Applied OCR fills tracked in:
  - `data/reports/ocr-autofill-report.json`
- Remaining gaps stay in review queue.

## 6) sq6 authoritative CSV answers

Problem:

- PDF answer table extraction for `sq6` has low reliability.

Handling:

- Use `sq6-answers.csv` as source of truth for `sq6` answers.
- Build applies CSV rows for question numbers `1..176`.
- Rows outside current range (for example `177-178`) are preserved as reference and reported, not applied.
- TODO: investigate missing `sq6` questions `177-178` in extracted dataset.
- Verify whether this is a parser error or a source PDF issue.

Artifacts:

- Input: `sq6-answers.csv`
- Reference copy: `data/reference/sq6-answers.csv`
- Validation/report: `data/reports/sq6-csv-report.json`
