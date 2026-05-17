import { scoreQuestion } from "../practice-test/session.js";

export const PRACTICE_TAG_PROGRESS_KEY = "practice_tag_progress_v1";

function hasStorage(storage) {
  return storage && typeof storage.getItem === "function" && typeof storage.setItem === "function";
}

function buildTagStats(questions, responses) {
  const map = new Map();

  for (let i = 0; i < questions.length; i += 1) {
    const q = questions[i];
    const r = responses?.[i];
    const score = scoreQuestion(q, r);
    const tags = Array.isArray(q.tags) && q.tags.length > 0 ? q.tags : ["general"];
    for (const tag of tags) {
      const key = String(tag).toLowerCase();
      if (!map.has(key)) {
        map.set(key, { tag: key, attempts: 0, totalScore: 0 });
      }
      const row = map.get(key);
      row.attempts += 1;
      row.totalScore += score;
    }
  }

  return Array.from(map.values()).map((row) => ({
    tag: row.tag,
    attempts: row.attempts,
    averageScore: row.attempts > 0 ? row.totalScore / row.attempts : 0
  }));
}

export function saveTagProgressSnapshot(storage, snapshot) {
  if (!hasStorage(storage)) {
    return;
  }
  storage.setItem(PRACTICE_TAG_PROGRESS_KEY, JSON.stringify(snapshot));
}

export function buildTagProgressSnapshot({ questions, responses, selectedTags }) {
  const reviewedItems = questions
    .map((q, idx) => ({ q, r: responses[idx] }))
    .filter((item) => item.r?.revealed || item.r?.skipped);

  const reviewedAverage =
    reviewedItems.length > 0
      ? reviewedItems.reduce((sum, item) => sum + scoreQuestion(item.q, item.r), 0) /
        reviewedItems.length
      : 0;

  return {
    mode: "tag_practice",
    savedAt: Date.now(),
    selectedTags: selectedTags ?? [],
    questionCount: questions.length,
    reviewedCount: reviewedItems.length,
    averageReviewedScore: reviewedAverage,
    perTag: buildTagStats(questions, responses)
  };
}

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
