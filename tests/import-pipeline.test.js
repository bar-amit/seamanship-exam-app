import test from "node:test";
import assert from "node:assert/strict";
import {
  buildImportConfig,
  buildImportReport,
  buildImportUploadPlan,
  parseImportArgs,
  resolveAssetSourcePath
} from "../src/lib/import/pipeline.js";

test("parseImportArgs supports --key value, --key=value and flags", () => {
  const parsed = parseImportArgs([
    "--input",
    "questions.json",
    "--collection=staging_questions",
    "--dry-run",
    "--skip-upload"
  ]);

  assert.equal(parsed.args.get("--input"), "questions.json");
  assert.equal(parsed.args.get("--collection"), "staging_questions");
  assert.equal(parsed.flags.has("--dry-run"), true);
  assert.equal(parsed.flags.has("--skip-upload"), true);
});

test("buildImportConfig applies defaults and typed overrides", () => {
  const config = buildImportConfig([
    "--input",
    "custom/input.json",
    "--report",
    "tmp/report.json",
    "--limit",
    "25",
    "--storage-prefix=staging-assets",
    "--dry-run",
    "--skip-firestore"
  ]);

  assert.equal(config.inputPath, "custom/input.json");
  assert.equal(config.reportPath, "tmp/report.json");
  assert.equal(config.limit, 25);
  assert.equal(config.storagePrefix, "staging-assets");
  assert.equal(config.collectionName, "questions");
  assert.equal(config.dryRun, true);
  assert.equal(config.skipUpload, false);
  assert.equal(config.skipFirestore, true);
});

test("buildImportUploadPlan resolves extracted and legacy asset source lookup", () => {
  assert.equal(
    resolveAssetSourcePath("sq11-images/image_36.jpg", {
      dataAssetsDir: "data/assets",
      rawAssetsDir: "data/raw",
      legacyImagesDir: "legacy/images"
    }),
    "data/raw/sq11-images/image_36.jpg"
  );

  assert.equal(
    resolveAssetSourcePath("legacy-images/image_36.jpg", {
      dataAssetsDir: "data/assets",
      rawAssetsDir: "data/raw",
      legacyImagesDir: "legacy/images"
    }),
    "legacy/images/image_36.jpg"
  );

  const plan = buildImportUploadPlan(["sq11-images/image_36.jpg", "legacy-images/image_36.jpg", "sq5/q102-a.jpg"], {
    dataAssetsDir: "data/assets",
    rawAssetsDir: "data/raw",
    legacyImagesDir: "legacy/images",
    storagePrefix: "question-assets"
  });

  assert.deepEqual(plan, [
    {
      ref: "sq11-images/image_36.jpg",
      sourcePath: "data/raw/sq11-images/image_36.jpg",
      destinationPath: "question-assets/sq11-images/image_36.jpg"
    },
    {
      ref: "legacy-images/image_36.jpg",
      sourcePath: "legacy/images/image_36.jpg",
      destinationPath: "question-assets/legacy-images/image_36.jpg"
    },
    {
      ref: "sq5/q102-a.jpg",
      sourcePath: "data/assets/sq5/q102-a.jpg",
      destinationPath: "question-assets/sq5/q102-a.jpg"
    }
  ]);
});

test("buildImportReport keeps the importer audit output contract", () => {
  const config = buildImportConfig(["--dry-run", "--collection", "staging_questions"]);
  const report = buildImportReport({
    generatedAt: "2026-05-17T10:00:00.000Z",
    config,
    sourceRecords: 100,
    normalizedRecords: 98,
    importedRecords: 10,
    referencedAssets: 4,
    uploadedAssets: 0,
    missingAssets: ["missing.jpg"],
    firestoreWritten: 0
  });

  assert.deepEqual(report, {
    generated_at: "2026-05-17T10:00:00.000Z",
    dry_run: true,
    input_path: "test_material/data/questions-all.json",
    manifest_path: "test_material/data/assets/sq5-option-images.json",
    legacy_sq3_path: "test_material/questions/seamanship_questions.json",
    legacy_images_metadata_path: "test_material/test_images/images.json",
    data_assets_dir: "test_material/data/assets",
    raw_assets_dir: "test_material/data/assets",
    legacy_images_dir: "test_material/test_images/images",
    collection: "staging_questions",
    storage_prefix: "question-assets",
    source_records: 100,
    normalized_records: 98,
    imported_records: 10,
    referenced_assets: 4,
    uploaded_assets: 0,
    missing_assets: ["missing.jpg"],
    firestore_written: 0,
    validation: null
  });
});
