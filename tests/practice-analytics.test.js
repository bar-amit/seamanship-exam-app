import test from "node:test";
import assert from "node:assert/strict";
import {
  PRACTICE_TAG_PROGRESS_KEY,
  PRACTICE_TEST_HISTORY_KEY,
  buildPracticeTestSummary,
  buildTagProgressSnapshot,
  pushTestSummary,
  saveTagProgressSnapshot
} from "../src/lib/practice/analytics.js";

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    }
  };
}

test("buildPracticeTestSummary returns score/review/perTag", () => {
  const questions = [
    { type: "mcq", correct_choice_id: "a", tags: ["seamanship"] },
    { type: "mcq", correct_choice_id: "b", tags: ["mechanics"] }
  ];
  const responses = [{ choiceId: "a" }, { choiceId: "c" }];
  const summary = buildPracticeTestSummary({
    questions,
    responses,
    startedAt: 1000,
    endedAt: 6000
  });

  assert.equal(summary.questionCount, 2);
  assert.equal(summary.durationSec, 5);
  assert.equal(summary.overallScore, 50);
  assert.equal(summary.review.correct, 1);
  assert.equal(summary.review.incorrect, 1);
  assert.equal(summary.perTag.length, 2);
});

test("pushTestSummary prepends and caps history", () => {
  const storage = createMemoryStorage();
  pushTestSummary(storage, { n: 1 }, 2);
  pushTestSummary(storage, { n: 2 }, 2);
  pushTestSummary(storage, { n: 3 }, 2);
  const history = JSON.parse(storage.getItem(PRACTICE_TEST_HISTORY_KEY));
  assert.deepEqual(history.map((x) => x.n), [3, 2]);
});

test("tag progress snapshot/save works", () => {
  const questions = [{ type: "mcq", correct_choice_id: "a", tags: ["navigation a"] }];
  const responses = [{ choiceId: "a", revealed: true }];
  const snap = buildTagProgressSnapshot({ questions, responses, selectedTags: ["navigation a"] });
  const storage = createMemoryStorage();
  saveTagProgressSnapshot(storage, snap);
  const saved = JSON.parse(storage.getItem(PRACTICE_TAG_PROGRESS_KEY));
  assert.equal(saved.questionCount, 1);
  assert.equal(saved.reviewedCount, 1);
  assert.equal(saved.perTag[0].tag, "navigation a");
});
