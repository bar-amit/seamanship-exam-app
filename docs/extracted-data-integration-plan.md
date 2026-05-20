# Extracted Data Integration Plan

Last updated: 2026-05-20

## Goal

Move the app from the older `test_material/data/questions-all.json` import contract to the improved extracted dataset now copied into `test_material/data`, preserving current practice behavior while enabling richer question assets and open-answer structure.

## Source Inputs

Canonical tracked import dataset:

- `test_material/data/questions-all.json`
- `test_material/data/questions-sq3.json`
- `test_material/data/questions-sq4.json`
- `test_material/data/questions-sq5.json`
- `test_material/data/questions-sq6.json`

Extraction docs and reports:

- `test_material/data/docs/data-extraction.md`
- `test_material/data/docs/data-edge-cases.md`
- `test_material/data/docs/data-remediation.md`
- `test_material/data/docs/session-handoff.md`
- `test_material/data/reports/summary.json`
- `test_material/data/reports/validation-report.json`
- `test_material/data/reports/language-quality-report.json`
- `test_material/data/reports/sq4-subanswer-report.json`

Asset inputs:

- `test_material/data/assets/sq11-images/*`
- `test_material/data/assets/sq3-inline-images/*`
- `test_material/data/assets/sq5-option-images/*`
- `test_material/data/assets/sq3-inline-images.json`
- `test_material/data/assets/sq5-option-images.json`

Untracked handoff source:

- `extracted_data/` remains ignored by git.
- Only the import-ready subset is tracked under `test_material/data`.

## Current Dataset Delta

Compared with the previous import source:

- Total records change from `826` to `827`.
- `sq4-q096` is present in the improved data.
- Question-level assets expand from single `image_ref` assumptions to canonical `image_refs[]`.
- Unique referenced assets in raw extracted records are `73` and resolve locally with no missing files.
- Import normalization backfills complete sq5 option-image refs from the manifest and adds the shared positioning diagram asset, so the importer dry-run baseline references `78` assets.
- Asset prefixes are `sq11-images`, `sq3-inline-images`, and `sq5-option-images`.
- `sub_answers[]` is available for aligned `sq4` sub-question answers.
- `references_sq11_positioning_diagram` is available on relevant seamanship questions.
- Source `tags[]` are empty; importer must continue deriving fallback chapter tags.
- Some open-text questions intentionally have no `sub_questions`; the app must continue treating those as single-prompt open answers.

Extraction report baseline:

- `validation_errors`: `0`
- `review_queue_items`: `0`
- `language_quality_gate_pass`: `true`
- `sq4_subanswer_alignment_rate`: `1.0`

## Target App Data Contract

Question documents should support:

- `image_ref`: backward-compatible primary image reference.
- `image_storage_path`: backward-compatible primary storage path.
- `image_refs[]`: canonical ordered list of question-level image references.
- `image_storage_paths[]`: ordered storage paths corresponding to `image_refs[]`.
- `choices[].image_ref`: optional choice-level image reference.
- `choices[].image_storage_path`: storage path for choice-level image reference.
- `sub_answers[]`: per-sub-question answer text for `open_text` questions.
- `model_answer`: full open-text model answer fallback.
- `references_sq11_positioning_diagram`: boolean metadata for questions that reference the sq11 positioning diagram.
- `position_diagram.png`: shared positioning diagram asset shown when `references_sq11_positioning_diagram` is true.

Compatibility rule:

- Existing UI paths that only read `image_ref` / `image_storage_path` must continue working during migration.
- New UI paths should prefer `image_refs[]` when rendering multiple question-level assets.

## Implementation Phases

### Phase 1: Importer and Data Contract

Status: completed on 2026-05-20.

Scope:

- Point importer defaults at `test_material/data/questions-all.json` and new asset manifests.
- Resolve assets from `test_material/data/assets`, with legacy paths retained as optional fallback for older imports.
- Normalize `image_refs[]`, `image_storage_paths[]`, `sub_answers[]`, and `references_sq11_positioning_diagram`.
- Collect referenced assets from `image_ref`, `image_refs[]`, and `choices[].image_ref`.
- Include `sq4-q096`; no hardcoded skip for the improved dataset.
- Strengthen validation for image storage paths and `sub_answers[]` alignment.
- Update importer tests and dry-run baseline from `826` to `827` records.

Acceptance:

- Targeted importer tests pass.
- Full `npm test` passes.
- `npm run build` passes.
- Dry run against tracked extracted data reports:
  - `source_records`: `827`
  - `normalized_records`: `827`
  - `imported_records`: `827`
  - `referenced_assets`: `77`
  - `missing_assets`: `[]`
  - validation errors: `0`
  - validation warnings: `19` intentional open-text single-prompt questions

Implementation notes:

- Importer defaults now point to `test_material/data/questions-all.json`.
- Asset upload planning resolves `sq11-images/*`, `sq3-inline-images/*`, and `sq5-option-images/*` from `test_material/data/assets`.
- The importer preserves `image_refs[]`, writes `image_storage_paths[]`, preserves `sub_answers[]`, and includes `references_sq11_positioning_diagram`.
- Legacy sq3 image metadata files are optional fallback inputs, not required for the extracted dataset.
- `sq4-q096` is included; the previous hardcoded skip was removed.

### Phase 2: Practice and Review Rendering

Status: completed on 2026-05-20.

Scope:

- Render all question-level `image_refs[]` in practice and review surfaces.
- Render the shared positioning diagram for questions with `references_sq11_positioning_diagram`.
- Avoid duplicate image display when an asset appears both as question-level and choice-level metadata.
- Keep existing choice image rendering.
- Display `sub_answers[]` beside sub-questions in review when available, falling back to `model_answer`.
- Add tests for multi-image and sub-answer view-model behavior.

Implementation notes:

- `QuestionImageList` renders `image_refs[]` through existing clickable image previews.
- `QuestionImageList` appends the shared `position_diagram.png` image when `references_sq11_positioning_diagram` is true.
- Choice-level images are excluded from question-level rendering to avoid duplicate display.
- Practice and tag-practice surfaces show `sub_answers[]` next to sub-questions when review/study aids are visible.
- Open-text questions without sub-questions score as completed single prompts when the user provides text.
- Import normalization rewrites `sub_questions[]` and `sub_answers[]` IDs by order so self-grading keys stay unique even when extraction produced duplicate labels/IDs.

### Phase 3: Admin Preservation and Editing

Status: completed on 2026-05-20.

Scope:

- Allow open-text questions with zero `sub_questions` in admin updates.
- Preserve `image_refs[]`, `image_storage_paths[]`, `sub_answers[]`, and `references_sq11_positioning_diagram` during admin saves.
- Add display/edit affordances for multi-image refs and sub-answers as needed.
- Add admin normalization tests for the new metadata.

Completed:

- Admin updates now allow open-text questions with zero `sub_questions`.
- Admin saves still merge patches with the existing document, so imported `image_refs[]`, `image_storage_paths[]`, `sub_answers[]`, and `references_sq11_positioning_diagram` are preserved when not explicitly edited.
- Admin editor exposes newline-based `image_refs[]` editing and derives primary `image_ref` plus `image_storage_paths[]` on save.
- Admin editor exposes `references_sq11_positioning_diagram` as a checkbox.
- Admin editor exposes `sub_answers[]` beside open-text sub-question rows and aligns answers to normalized sub-question IDs/orders on save.

### Phase 4: Staging Import and Smoke Validation

Status: partially completed on 2026-05-20.

Scope:

- Run staging dry import with the extracted dataset.
- Run full staging import only after approval because it writes Storage and Firestore.
- Smoke test practice, tag practice, review, collections, admin edit, and asset rendering.

Completed:

- `npm run validate:env:staging` passes with the local staging env.
- `npm run import:phase2:staging:dry` passes against the tracked extracted dataset:
  - `source_records`: `827`
  - `normalized_records`: `827`
  - `imported_records`: `827`
  - `referenced_assets`: `78`
  - `missing_assets`: `[]`
  - validation errors: `0`
  - validation warnings: `19` intentional open-text single-prompt questions

Remaining:

- Run `npm run import:phase2:staging` after explicit approval because it writes Storage and Firestore.
- Deploy/verify staging app if not already deployed.
- Execute `docs/staging-smoke-checklist.md` against staging, including admin metadata edits and asset rendering.
