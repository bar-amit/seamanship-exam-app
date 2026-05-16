import { scoreSession, scoreQuestion } from "./session.js";
import { buildReviewSummary } from "./review.js";

export const PRACTICE_TEST_HISTORY_KEY = "practice_test_history_v1";
export const PRACTICE_TAG_PROGRESS_KEY = "practice_tag_progress_v1";

function hasStorage(storage) {
  return storage && typeof storage.getItem === "function" && typeof storage.setItem === "function";
}

function safeParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
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

export function buildPracticeTestSummary({ questions, responses, startedAt, endedAt }) {
  return {
    mode: "practice_test",
    startedAt,
    endedAt,
    durationSec: Math.max(0, Math.floor((endedAt - startedAt) / 1000)),
    questionCount: questions.length,
    overallScore: scoreSession(questions, responses),
    review: buildReviewSummary(questions, responses),
    perTag: buildTagStats(questions, responses)
  };
}

export function pushTestSummary(storage, summary, maxItems = 50) {
  if (!hasStorage(storage)) {
    return;
  }
  const current = safeParse(storage.getItem(PRACTICE_TEST_HISTORY_KEY), []);
  const next = [summary, ...current].slice(0, maxItems);
  storage.setItem(PRACTICE_TEST_HISTORY_KEY, JSON.stringify(next));
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
