import test from "node:test";
import assert from "node:assert/strict";
import {
  hasAttempt,
  scoreQuestion,
  scoreSession,
  getQuestionStatus
} from "../src/lib/practice/session.js";

const mcq = {
  id: "q1",
  type: "mcq",
  correct_choice_id: "b"
};

const openText = {
  id: "q2",
  type: "open_text",
  sub_questions: [{ id: "a" }, { id: "b" }, { id: "c" }, { id: "d" }]
};

test("hasAttempt supports mcq and open_text", () => {
  assert.equal(hasAttempt(mcq, { choiceId: "a" }), true);
  assert.equal(hasAttempt(mcq, { skipped: true, choiceId: "a" }), false);
  assert.equal(hasAttempt(openText, { text: "  answer  " }), true);
  assert.equal(hasAttempt(openText, { text: "   " }), false);
});

test("scoreQuestion mcq returns 100 for correct and 0 for incorrect", () => {
  assert.equal(scoreQuestion(mcq, { choiceId: "b" }), 100);
  assert.equal(scoreQuestion(mcq, { choiceId: "a" }), 0);
});

test("scoreQuestion open_text supports equal-weight partial grading", () => {
  const score = scoreQuestion(openText, {
    text: "some text",
    subGrades: { a: true, b: true, c: true, d: false }
  });
  assert.equal(score, 75);
});

test("scoreSession averages per-question scores equally", () => {
  const score = scoreSession(
    [mcq, openText],
    [{ choiceId: "b" }, { text: "x", subGrades: { a: true, b: true, c: false, d: false } }]
  );
  assert.equal(score, 75);
});

test("getQuestionStatus reflects navigator states", () => {
  assert.equal(getQuestionStatus(mcq, null, false), "unanswered");
  assert.equal(getQuestionStatus(mcq, { skipped: true }, false), "skipped");
  assert.equal(getQuestionStatus(mcq, { choiceId: "a" }, false), "answered");
  assert.equal(getQuestionStatus(mcq, { choiceId: "a" }, true), "current");
});
