function normalizeId(value) {
  return String(value ?? "").trim();
}

export function normalizeQuestionIds(ids = []) {
  return Array.from(new Set(ids.map((id) => normalizeId(id)).filter(Boolean)));
}

export function collectionHasQuestion(collection, questionId) {
  const target = normalizeId(questionId);
  if (!target) {
    return false;
  }
  return normalizeQuestionIds(collection?.question_ids ?? []).includes(target);
}

export function buildCollectionQuestionIds(collection, questionId) {
  return normalizeQuestionIds([...(collection?.question_ids ?? []), questionId]);
}

export function buildCollectionUpdatePayload(collection, questionId) {
  return {
    name: String(collection?.name ?? "").trim(),
    description: String(collection?.description ?? "").trim(),
    questionIds: buildCollectionQuestionIds(collection, questionId)
  };
}

export function buildCollectionCreatePayload({ name, description, questionId }) {
  return {
    name: String(name ?? "").trim(),
    description: String(description ?? "").trim(),
    questionIds: normalizeQuestionIds([questionId])
  };
}
