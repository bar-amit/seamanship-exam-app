#!/usr/bin/env node
import fs from "node:fs";
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
import {
  buildImportConfig,
  buildImportReport,
  buildImportUploadPlan
} from "../src/lib/import/pipeline.js";
import { validateImportQuestions } from "../src/lib/import/validate.js";

function nowIso() {
  return new Date().toISOString();
}

async function main() {
  const config = buildImportConfig(process.argv.slice(2));

  const sourceQuestions = JSON.parse(fs.readFileSync(config.inputPath, "utf8"));
  const sq5Manifest = JSON.parse(fs.readFileSync(config.manifestPath, "utf8"));
  const legacySq3 = JSON.parse(fs.readFileSync(config.legacySq3Path, "utf8"));
  const legacyImagesMetadata = JSON.parse(fs.readFileSync(config.legacyImagesMetadataPath, "utf8"));
  const sq5ChoiceImageMap = buildSq5ChoiceImageMap(sq5Manifest);
  const sq3AssetByQuestionNumber = buildSq3AssetByQuestionNumber(legacySq3);
  const legacyImageDescriptionByFile = buildLegacyImageDescriptionByFile(legacyImagesMetadata);

  const normalizedAll = sourceQuestions
    .map((q) =>
      normalizeQuestionForImport(q, {
        sq5ChoiceImageMap,
        sq3AssetByQuestionNumber,
        legacyImageDescriptionByFile,
        storagePrefix: config.storagePrefix
      })
    )
    .filter(Boolean);

  const normalized = config.limit ? normalizedAll.slice(0, config.limit) : normalizedAll;
  const validation = validateImportQuestions(normalized);

  const assetRefs = collectReferencedAssets(normalized);
  const uploadPlan = buildImportUploadPlan(assetRefs, {
    dataAssetsDir: config.dataAssetsDir,
    legacyImagesDir: config.legacyImagesDir,
    storagePrefix: config.storagePrefix
  });

  if (!validation.ok) {
    const missingAssets = uploadPlan.filter((item) => !fs.existsSync(item.sourcePath)).map((item) => item.ref);
    const report = buildImportReport({
      generatedAt: nowIso(),
      config,
      sourceRecords: sourceQuestions.length,
      normalizedRecords: normalizedAll.length,
      importedRecords: 0,
      referencedAssets: assetRefs.length,
      uploadedAssets: 0,
      missingAssets,
      firestoreWritten: 0,
      validation
    });

    fs.writeFileSync(config.reportPath, `${JSON.stringify(report, null, 2)}\n`);
    console.log(JSON.stringify(report, null, 2));
    process.exitCode = 1;
    return;
  }

  let uploaded = [];
  let missingAssets = [];
  let firestoreWritten = 0;
  let firebaseAdminDb = null;
  let firebaseAdminStorage = null;

  if (!config.dryRun && (!config.skipUpload || !config.skipFirestore)) {
    const admin = await import("../src/lib/firebase/admin.js");
    firebaseAdminDb = admin.firebaseAdminDb;
    firebaseAdminStorage = admin.firebaseAdminStorage;
  }

  if (!config.dryRun && !config.skipUpload) {
    const bucket = firebaseAdminStorage.bucket();
    const uploadResult = await uploadAssetsToStorage({ bucket, uploadPlan });
    uploaded = uploadResult.uploaded;
    missingAssets = uploadResult.missing;
  } else {
    missingAssets = uploadPlan.filter((item) => !fs.existsSync(item.sourcePath)).map((item) => item.ref);
  }

  if (!config.dryRun && !config.skipFirestore) {
    firestoreWritten = await writeQuestionsToFirestore({
      db: firebaseAdminDb,
      collectionName: config.collectionName,
      questions: normalized
    });
  }

  const report = buildImportReport({
    generatedAt: nowIso(),
    config,
    sourceRecords: sourceQuestions.length,
    normalizedRecords: normalizedAll.length,
    importedRecords: normalized.length,
    referencedAssets: assetRefs.length,
    uploadedAssets: uploaded.length,
    missingAssets,
    firestoreWritten,
    validation
  });

  fs.writeFileSync(config.reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
