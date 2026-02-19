function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toInt(value, fallback = 0) {
  return Math.max(0, Math.round(toNumber(value, fallback)));
}

function normalizeTag(value) {
  return String(value ?? "").trim().toLowerCase();
}

function normalizeSelectedTags(tags) {
  if (!Array.isArray(tags)) {
    return [];
  }
  return Array.from(new Set(tags.map((tag) => normalizeTag(tag)).filter(Boolean)));
}

function normalizePerTag(perTag) {
  if (!Array.isArray(perTag)) {
    return [];
  }

  const map = new Map();
  for (const row of perTag) {
    const tag = normalizeTag(row?.tag);
    if (!tag) {
      continue;
    }

    const attempts = toInt(row?.attempts);
    const averageScore = Math.max(0, Math.min(100, toNumber(row?.averageScore, 0)));
    const existing = map.get(tag);
    if (!existing) {
      map.set(tag, { tag, attempts, averageScore });
      continue;
    }

    // Prefer the row with more attempts. If equal, keep the latest row.
    if (attempts > existing.attempts || attempts === existing.attempts) {
      map.set(tag, { tag, attempts, averageScore });
    }
  }

  return Array.from(map.values()).sort((a, b) => b.averageScore - a.averageScore);
}

export function normalizeTagProgressSnapshot(input) {
  const selectedTags = normalizeSelectedTags(input?.selectedTags);
  const perTag = normalizePerTag(input?.perTag);
  const questionCount = toInt(input?.questionCount);
  const reviewedCount = Math.min(toInt(input?.reviewedCount), questionCount);
  const averageReviewedScore = Math.max(0, Math.min(100, toNumber(input?.averageReviewedScore, 0)));

  return {
    mode: "tag_practice",
    savedAt: toInt(input?.savedAt, Date.now()),
    selectedTags,
    questionCount,
    reviewedCount,
    averageReviewedScore,
    perTag
  };
}

export function buildTagProgressDoc({ ownerEmail, snapshot, nowIso }) {
  return {
    owner_email: String(ownerEmail ?? "").trim().toLowerCase(),
    ...snapshot,
    updated_at: nowIso
  };
}
