# Import Recovery Runbook

Last updated: 2026-05-17

Use this runbook when bootstrapping, reseeding, or recovering question data and image assets. Day-to-day content edits should still happen through the admin UI against Firestore.

## Safety Model

- The importer validates normalized records before uploading assets or writing Firestore documents.
- Blocking validation errors stop the run and write an audit report with `imported_records: 0`.
- Validation warnings do not stop the run; they identify content that is supported by the app but should be reviewed.
- Dry runs never require Firebase credentials when `--skip-upload --skip-firestore` is used.

## Local Audit

Run a full local dry run before any staging or production import:

```bash
node scripts/import-phase2.js --dry-run --skip-upload --skip-firestore --report /tmp/seamanship-import-report.json
```

Expected current baseline:

- `source_records`: `826`
- `normalized_records`: `826`
- `imported_records`: `826`
- `referenced_assets`: `46`
- `missing_assets`: `[]`
- `validation.ok`: `true`
- `validation.warning_count`: `14` for open-text questions without `sub_questions`

## Staging Import

1. Validate staging environment variables:

```bash
npm run validate:env:staging
```

2. Run the staging dry run:

```bash
npm run import:phase2:staging:dry
```

3. Review the generated report before writing data:

```bash
cat test_material/data/reports/import-report.json
```

4. Run the full staging importer only if `validation.ok` is `true` and `missing_assets` is empty:

```bash
npm run import:phase2:staging
```

5. Confirm question count and sample image rendering in staging.

## Failure Handling

If `validation.ok` is `false`:

- Do not rerun with Firestore writes enabled until the report errors are fixed.
- Use `validation.errors[].question_id`, `code`, and `path` to locate the bad record in `test_material/data/questions-all.json`.
- Re-run the local audit after fixing data or normalization rules.

If `missing_assets` is not empty:

- Confirm whether each reference should resolve under `test_material/data/assets` or `test_material/test_images/images`.
- Restore missing files or fix the source question image reference.
- Re-run the local audit before staging import.

If a Firestore write fails after assets upload:

- Keep the report from the failed run for audit context.
- Fix the Firebase credential, rule, or connectivity issue.
- Re-run the importer. Question documents are written by deterministic id, so a retry updates the same documents.

If asset upload fails:

- Fix the missing file, permission, or bucket issue.
- Re-run the importer. Storage object paths are deterministic under `storage_prefix`, so a retry overwrites the intended object path.

## Report Fields

- `source_records`: raw records loaded from the source JSON.
- `normalized_records`: records after normalization and skip rules.
- `imported_records`: records eligible for persistence in this run.
- `referenced_assets`: unique image references found after normalization.
- `uploaded_assets`: assets uploaded in this run.
- `missing_assets`: referenced assets not found locally.
- `firestore_written`: question documents written in this run.
- `validation`: blocking errors and audit warnings from the validation stage.
