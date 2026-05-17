import path from "node:path";

export const DEFAULT_IMPORT_CONFIG = {
  inputPath: "test_material/data/questions-all.json",
  manifestPath: "test_material/data/assets/sq5-option-images.json",
  legacySq3Path: "test_material/questions/seamanship_questions.json",
  legacyImagesMetadataPath: "test_material/test_images/images.json",
  dataAssetsDir: "test_material/data/assets",
  legacyImagesDir: "test_material/test_images/images",
  reportPath: "test_material/data/reports/import-report.json",
  collectionName: "questions",
  storagePrefix: "question-assets",
  limit: null,
  dryRun: false,
  skipUpload: false,
  skipFirestore: false
};

export function parseImportArgs(argv) {
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

export function buildImportConfig(argv) {
  const { args, flags } = parseImportArgs(argv);
  const limit = args.has("--limit") ? Number(args.get("--limit")) : null;

  return {
    inputPath: args.get("--input") ?? DEFAULT_IMPORT_CONFIG.inputPath,
    manifestPath: args.get("--manifest") ?? DEFAULT_IMPORT_CONFIG.manifestPath,
    legacySq3Path: args.get("--legacy-sq3") ?? DEFAULT_IMPORT_CONFIG.legacySq3Path,
    legacyImagesMetadataPath:
      args.get("--legacy-images-metadata") ?? DEFAULT_IMPORT_CONFIG.legacyImagesMetadataPath,
    dataAssetsDir: args.get("--assets-dir") ?? DEFAULT_IMPORT_CONFIG.dataAssetsDir,
    legacyImagesDir: args.get("--legacy-images-dir") ?? DEFAULT_IMPORT_CONFIG.legacyImagesDir,
    reportPath: args.get("--report") ?? DEFAULT_IMPORT_CONFIG.reportPath,
    collectionName: args.get("--collection") ?? DEFAULT_IMPORT_CONFIG.collectionName,
    storagePrefix: args.get("--storage-prefix") ?? DEFAULT_IMPORT_CONFIG.storagePrefix,
    limit: Number.isFinite(limit) ? limit : DEFAULT_IMPORT_CONFIG.limit,
    dryRun: flags.has("--dry-run"),
    skipUpload: flags.has("--skip-upload"),
    skipFirestore: flags.has("--skip-firestore")
  };
}

export function resolveAssetSourcePath(ref, { dataAssetsDir, legacyImagesDir }) {
  // Temporary dual-source lookup: normalized sq5 assets and legacy sq3 images.
  if (ref.startsWith("legacy-images/")) {
    const fileName = ref.slice("legacy-images/".length);
    return path.join(legacyImagesDir, fileName);
  }
  return path.join(dataAssetsDir, ref);
}

export function buildImportUploadPlan(assetRefs, { dataAssetsDir, legacyImagesDir, storagePrefix }) {
  return assetRefs.map((ref) => ({
    ref,
    sourcePath: resolveAssetSourcePath(ref, { dataAssetsDir, legacyImagesDir }),
    destinationPath: `${storagePrefix}/${ref}`.replace(/\/+/g, "/")
  }));
}

export function buildImportReport({
  generatedAt,
  config,
  sourceRecords,
  normalizedRecords,
  importedRecords,
  referencedAssets,
  uploadedAssets,
  missingAssets,
  firestoreWritten
}) {
  return {
    generated_at: generatedAt,
    dry_run: config.dryRun,
    input_path: config.inputPath,
    manifest_path: config.manifestPath,
    legacy_sq3_path: config.legacySq3Path,
    legacy_images_metadata_path: config.legacyImagesMetadataPath,
    data_assets_dir: config.dataAssetsDir,
    legacy_images_dir: config.legacyImagesDir,
    collection: config.collectionName,
    storage_prefix: config.storagePrefix,
    source_records: sourceRecords,
    normalized_records: normalizedRecords,
    imported_records: importedRecords,
    referenced_assets: referencedAssets,
    uploaded_assets: uploadedAssets,
    missing_assets: missingAssets,
    firestore_written: firestoreWritten
  };
}
