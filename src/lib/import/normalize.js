import path from "node:path";

const HEBREW_LABELS_BY_INDEX = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י"];

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

function uniqueNonEmptyStrings(values) {
  const refs = [];
  const seen = new Set();

  for (const value of values) {
    const ref = typeof value === "string" ? value.trim() : "";
    if (!ref || seen.has(ref)) {
      continue;
    }
    seen.add(ref);
    refs.push(ref);
  }

  return refs;
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

function toOrderedItemId(index) {
  return String.fromCharCode("a".charCodeAt(0) + index);
}

function normalizeOrderedTextItems(items, referenceItems = null) {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item, index) => {
    const reference = referenceItems?.[index] ?? null;
    const id = reference?.id ?? toOrderedItemId(index);
    const label = reference?.label ?? HEBREW_LABELS_BY_INDEX[index] ?? id.toUpperCase();

    return {
      ...item,
      id,
      label,
      order: index + 1
    };
  });
}

export function normalizeQuestionForImport(question, options = {}) {
  const {
    sq5ChoiceImageMap = {},
    sq3AssetByQuestionNumber = {},
    legacyImageDescriptionByFile = {},
    storagePrefix = "question-assets",
    skipIds = new Set()
  } = options;

  if (skipIds.has(question.id)) {
    return null;
  }

  if (question.type !== "mcq" && question.type !== "open_text") {
    throw new Error(`Unsupported question type: ${question.type} (${question.id})`);
  }

  const chapterTag = toChapterTag(question.chapter);
  const tags = Array.isArray(question.tags) && question.tags.length > 0 ? question.tags : [chapterTag];

  let topLevelImageRef = question.image_ref;
  let imageDescription = question.image_description ?? null;
  if (!topLevelImageRef && question.source_file === "sq3") {
    const sq3File = sq3AssetByQuestionNumber[String(question.question_number)] ?? null;
    if (sq3File) {
      topLevelImageRef = `legacy-images/${sq3File}`;
      imageDescription = legacyImageDescriptionByFile[sq3File] ?? imageDescription;
    }
  }

  const sq5Map = sq5ChoiceImageMap[String(question.question_number)] ?? {};
  const choices = Array.isArray(question.choices)
    ? question.choices.map((choice) => normalizeChoice(choice, sq5Map[String(choice.id)] ?? null, storagePrefix))
    : [];
  const imageRefs = uniqueNonEmptyStrings([topLevelImageRef, ...(question.image_refs ?? [])]);
  if (!topLevelImageRef && imageRefs.length > 0) {
    topLevelImageRef = imageRefs[0];
  }
  const subQuestions = normalizeOrderedTextItems(question.sub_questions);
  const subAnswers = normalizeOrderedTextItems(question.sub_answers, subQuestions);

  const normalized = {
    ...question,
    tags,
    image_ref: topLevelImageRef,
    image_refs: imageRefs,
    image_description: imageDescription,
    choices,
    sub_questions: subQuestions,
    image_storage_path: toStoragePath(topLevelImageRef, storagePrefix),
    image_storage_paths: imageRefs.map((ref) => toStoragePath(ref, storagePrefix)),
    sub_answers: subAnswers,
    references_sq11_positioning_diagram: Boolean(question.references_sq11_positioning_diagram),
    import_meta: {
      normalized_at: new Date().toISOString(),
      source: "phase2-importer-v1"
    }
  };

  return normalized;
}

export function collectReferencedAssets(questions) {
  const refs = new Set();

  for (const q of questions) {
    if (q?.image_ref) {
      refs.add(q.image_ref);
    }
    for (const imageRef of q?.image_refs ?? []) {
      if (imageRef) {
        refs.add(imageRef);
      }
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
