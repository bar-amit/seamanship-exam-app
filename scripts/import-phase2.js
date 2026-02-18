#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import {
  buildSq5ChoiceImageMap,
  normalizeQuestionForImport,
  collectReferencedAssets,
  buildAssetUploadPlan
} from "../src/lib/import/normalize.js";
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

async function main() {
  const { args, flags } = parseArgs(process.argv.slice(2));
  const inputPath = args.get("--input") ?? "test_material/data/questions-all.json";
  const manifestPath = args.get("--manifest") ?? "test_material/data/assets/sq5-option-images.json";
  const assetsDir = args.get("--assets-dir") ?? "test_material/data/assets";
  const reportPath = args.get("--report") ?? "test_material/data/reports/import-report.json";
  const collectionName = args.get("--collection") ?? "questions";
  const storagePrefix = args.get("--storage-prefix") ?? "question-assets";
  const limit = args.has("--limit") ? Number(args.get("--limit")) : null;

  const dryRun = flags.has("--dry-run");
  const skipUpload = flags.has("--skip-upload");
  const skipFirestore = flags.has("--skip-firestore");

  const sourceQuestions = JSON.parse(fs.readFileSync(inputPath, "utf8"));
  const sq5Manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const sq5ChoiceImageMap = buildSq5ChoiceImageMap(sq5Manifest);

  const normalizedAll = sourceQuestions
    .map((q) => normalizeQuestionForImport(q, { sq5ChoiceImageMap, storagePrefix }))
    .filter(Boolean);

  const normalized = limit ? normalizedAll.slice(0, limit) : normalizedAll;

  const assetRefs = collectReferencedAssets(normalized);
  const uploadPlan = buildAssetUploadPlan(assetRefs, assetsDir, storagePrefix);

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
    assets_dir: assetsDir,
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
