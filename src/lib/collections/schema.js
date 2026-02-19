function normalizeText(value) {
  return String(value ?? "").trim();
}

export function normalizeCollectionInput(input) {
  const name = normalizeText(input?.name);
  const description = normalizeText(input?.description);
  const questionIds = Array.isArray(input?.questionIds)
    ? Array.from(new Set(input.questionIds.map((id) => normalizeText(id)).filter(Boolean)))
    : [];

  if (!name) {
    throw new Error("Collection name is required.");
  }

  return { name, description, questionIds };
}

export function buildCollectionDoc({ id, ownerEmail, name, description, questionIds, nowIso }) {
  return {
    id,
    owner_email: ownerEmail,
    name,
    description,
    question_ids: questionIds,
    created_at: nowIso,
    updated_at: nowIso
  };
}
