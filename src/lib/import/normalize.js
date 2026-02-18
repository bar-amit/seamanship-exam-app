import path from "node:path";

export function toChapterTag(chapter) {
  if (!chapter) {
    return "general";
  }
  return String(chapter).replace(/_/g, " ");
}

export function buildSq5ChoiceImageMap(manifest) {
  return manifest?.files ?? {};
}

export function toStoragePath(imageRef, storagePrefix) {
  if (!imageRef) {
    return null;
  }
  return `${storagePrefix}/${imageRef}`.replace(/\/+/g, "/");
}

function normalizeChoice(choice, manifestRef, storagePrefix) {
  const imageRef = choice?.image_ref ?? manifestRef ?? null;
  const imageStoragePath = toStoragePath(imageRef, storagePrefix);

  return {
    id: choice.id,
    label: choice.label,
    text: choice.text,
    image_ref: imageRef,
    image_storage_path: imageStoragePath
  };
}

export function normalizeQuestionForImport(question, options = {}) {
  const {
    sq5ChoiceImageMap = {},
    storagePrefix = "question-assets",
    skipIds = new Set(["sq4-q096"])
  } = options;

  if (skipIds.has(question.id)) {
    return null;
  }

  if (question.type !== "mcq" && question.type !== "open_text") {
    throw new Error(`Unsupported question type: ${question.type} (${question.id})`);
  }

  const chapterTag = toChapterTag(question.chapter);
  const tags = Array.isArray(question.tags) && question.tags.length > 0 ? question.tags : [chapterTag];

  const sq5Map = sq5ChoiceImageMap[String(question.question_number)] ?? {};
  const choices = Array.isArray(question.choices)
    ? question.choices.map((choice) => normalizeChoice(choice, sq5Map[String(choice.id)] ?? null, storagePrefix))
    : [];

  return {
    ...question,
    tags,
    choices,
    image_storage_path: toStoragePath(question.image_ref, storagePrefix),
    import_meta: {
      normalized_at: new Date().toISOString(),
      source: "phase2-importer-v1"
    }
  };
}

export function collectReferencedAssets(questions) {
  const refs = new Set();

  for (const q of questions) {
    if (q?.image_ref) {
      refs.add(q.image_ref);
    }
    for (const choice of q?.choices ?? []) {
      if (choice?.image_ref) {
        refs.add(choice.image_ref);
      }
    }
  }

  return Array.from(refs).sort();
}

export function buildAssetUploadPlan(assetRefs, assetsDir, storagePrefix) {
  return assetRefs.map((ref) => ({
    ref,
    sourcePath: path.join(assetsDir, ref),
    destinationPath: toStoragePath(ref, storagePrefix)
  }));
}
