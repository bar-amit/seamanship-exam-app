#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  buildSq5ChoiceImageMap,
  normalizeQuestionForImport,
  collectReferencedAssets
} from "../src/lib/import/normalize.js";
import {
  buildSq3AssetByQuestionNumber,
  buildLegacyImageDescriptionByFile
} from "../src/lib/import/sq3-assets.js";
import { uploadAssetsToStorage } from "../src/lib/import/storage.js";
import { writeQuestionsToFirestore } from "../src/lib/import/firestore.js";

function parseArgs(argv) {
  const args = new Map();
  const flags = new Set();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      continue;
    }
    if (token.includes("=")) {
      const [key, value] = token.split("=");
      args.set(key, value);
      continue;
    }
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) {
      flags.add(token);
    } else {
      args.set(token, next);
      i += 1;
    }
  }

  return { args, flags };
}

function nowIso() {
  return new Date().toISOString();
}

function resolveAssetSourcePath(ref, { dataAssetsDir, legacyImagesDir }) {
  // TODO(post-MVP): unify assets into a single canonical directory and remove dual-source lookup.
  // Current temporary behavior supports both normalized sq5 assets and legacy sq3 images.
  if (ref.startsWith("legacy-images/")) {
    const fileName = ref.slice("legacy-images/".length);
    return path.join(legacyImagesDir, fileName);
  }
  return path.join(dataAssetsDir, ref);
}

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  const inputPath = args.get("--input") ?? "test_material/data/questions-all.json";
  const manifestPath = args.get("--manifest") ?? "test_material/data/assets/sq5-option-images.json";
  const legacySq3Path = args.get("--legacy-sq3") ?? "test_material/questions/seamanship_questions.json";
  const legacyImagesMetadataPath = args.get("--legacy-images-metadata") ?? "test_material/test_images/images.json";
  const dataAssetsDir = args.get("--assets-dir") ?? "test_material/data/assets";
  const legacyImagesDir = args.get("--legacy-images-dir") ?? "test_material/test_images/images";
  const reportPath = args.get("--report") ?? "test_material/data/reports/import-report.json";
  const collectionName = args.get("--collection") ?? "questions";
  const storagePrefix = args.get("--storage-prefix") ?? "question-assets";
  const limit = args.has("--limit") ? Number(args.get("--limit")) : null;

  const dryRun = flags.has("--dry-run");
  const skipUpload = flags.has("--skip-upload");
  const skipFirestore = flags.has("--skip-firestore");

  const sourceQuestions = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const sq5Manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const legacySq3 = JSON.parse(fs.readFileSync(legacySq3Path, "utf8"));
  const legacyImagesMetadata = JSON.parse(fs.readFileSync(legacyImagesMetadataPath, "utf8"));
  const sq5ChoiceImageMap = buildSq5ChoiceImageMap(sq5Manifest);
  const sq3AssetByQuestionNumber = buildSq3AssetByQuestionNumber(legacySq3);
  const legacyImageDescriptionByFile = buildLegacyImageDescriptionByFile(legacyImagesMetadata);

  const normalizedAll = sourceQuestions
    .map((q) =>
      normalizeQuestionForImport(q, {
        sq5ChoiceImageMap,
        sq3AssetByQuestionNumber,
        legacyImageDescriptionByFile,
        storagePrefix
      })
    )
    .filter(Boolean);

  const normalized = limit ? normalizedAll.slice(0, limit) : normalizedAll;

  const assetRefs = collectReferencedAssets(normalized);
  const uploadPlan = assetRefs.map((ref) => ({
    ref,
    sourcePath: resolveAssetSourcePath(ref, { dataAssetsDir, legacyImagesDir }),
    destinationPath: `${storagePrefix}/${ref}`.replace(/\/+/g, "/")
  }));

  let uploaded = [];
  let missingAssets = [];
  let firestoreWritten = 0;
  let firebaseAdminDb = null;
  let firebaseAdminStorage = null;

  if (!dryRun && (!skipUpload || !skipFirestore)) {
    const admin = await import("../src/lib/firebase/admin.js");
    firebaseAdminDb = admin.firebaseAdminDb;
    firebaseAdminStorage = admin.firebaseAdminStorage;
  }

  if (!dryRun && !skipUpload) {
    const bucket = firebaseAdminStorage.bucket();
    const uploadResult = await uploadAssetsToStorage({ bucket, uploadPlan });
    uploaded = uploadResult.uploaded;
    missingAssets = uploadResult.missing;
  } else {
    missingAssets = uploadPlan.filter((item) => !fs.existsSync(item.sourcePath)).map((item) => item.ref);
  }

  if (!dryRun && !skipFirestore) {
    firestoreWritten = await writeQuestionsToFirestore({
      db: firebaseAdminDb,
      collectionName,
      questions: normalized
    });
  }

  const report = {
    generated_at: nowIso(),
    dry_run: dryRun,
    input_path: inputPath,
    manifest_path: manifestPath,
    legacy_sq3_path: legacySq3Path,
    legacy_images_metadata_path: legacyImagesMetadataPath,
    data_assets_dir: dataAssetsDir,
    legacy_images_dir: legacyImagesDir,
    collection: collectionName,
    storage_prefix: storagePrefix,
    source_records: sourceQuestions.length,
    normalized_records: normalizedAll.length,
    imported_records: normalized.length,
    referenced_assets: assetRefs.length,
    uploaded_assets: uploaded.length,
    missing_assets: missingAssets,
    firestore_written: firestoreWritten
  };

  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
