function normalizeRef(value) {
  return typeof value === "string" ? value.trim() : "";
}

function toStoragePath(imageRef, storagePrefix = "question-assets") {
  return imageRef ? `${storagePrefix}/${imageRef}`.replace(/\/+/g, "/") : null;
}

function uniqueRefs(values) {
  const seen = new Set();
  const refs = [];

  for (const value of values) {
    const ref = normalizeRef(value);
    if (!ref || seen.has(ref)) {
      continue;
    }
    seen.add(ref);
    refs.push(ref);
  }

  return refs;
}

export function getChoiceImageRefs(question) {
  return new Set(
    (question?.choices ?? [])
      .map((choice) => normalizeRef(choice?.image_ref))
      .filter(Boolean)
  );
}

export function getQuestionImageItems(question, { excludeChoiceImages = true } = {}) {
  const imageRefs = Array.isArray(question?.image_refs) && question.image_refs.length > 0
    ? question.image_refs
    : [question?.image_ref];
  const choiceImageRefs = excludeChoiceImages ? getChoiceImageRefs(question) : new Set();

  return uniqueRefs(imageRefs)
    .filter((imageRef) => !choiceImageRefs.has(imageRef))
    .map((imageRef) => {
      const imageRefsIndex = Array.isArray(question?.image_refs) ? question.image_refs.indexOf(imageRef) : -1;
      const storageFromList = imageRefsIndex >= 0 ? question?.image_storage_paths?.[imageRefsIndex] : null;
      const storageFromPrimary = imageRef === question?.image_ref ? question?.image_storage_path : null;

      return {
        imageRef,
        imageStoragePath: storageFromList || storageFromPrimary || toStoragePath(imageRef)
      };
    });
}
