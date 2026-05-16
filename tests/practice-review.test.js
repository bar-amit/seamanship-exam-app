import test from "node:test";
import assert from "node:assert/strict";
import {
  getReviewStatus,
  buildReviewSummary,
  shouldIncludeByFilter
} from "../src/features/practice-test/review.js";

const mcq = { id: "q1", type: "mcq", correct_choice_id: "b" };
const open = { id: "q2", type: "open_text", sub_questions: [{ id: "a" }, { id: "b" }] };

test("getReviewStatus returns correct states", () => {
  assert.equal(getReviewStatus(mcq, null), "unanswered");
  assert.equal(getReviewStatus(mcq, { skipped: true }), "skipped");
  assert.equal(getReviewStatus(mcq, { choiceId: "b" }), "correct");
  assert.equal(getReviewStatus(mcq, { choiceId: "a" }), "incorrect");
  assert.equal(getReviewStatus(open, { text: "x", subGrades: { a: true, b: false } }), "partial");
});

test("buildReviewSummary aggregates counts", () => {
  const summary = buildReviewSummary(
    [mcq, mcq, open],
    [{ choiceId: "b" }, { skipped: true }, { text: "x", subGrades: { a: true, b: false } }]
  );
  assert.deepEqual(summary, {
    total: 3,
    unanswered: 0,
    skipped: 1,
    correct: 1,
    incorrect: 0,
    partial: 1
  });
});

test("shouldIncludeByFilter supports all filter modes", () => {
  assert.equal(shouldIncludeByFilter("correct", "all"), true);
  assert.equal(shouldIncludeByFilter("incorrect", "mistakes"), true);
  assert.equal(shouldIncludeByFilter("partial", "mistakes"), true);
  assert.equal(shouldIncludeByFilter("correct", "mistakes"), false);
  assert.equal(shouldIncludeByFilter("skipped", "skipped"), true);
  assert.equal(shouldIncludeByFilter("correct", "correct"), true);
});
