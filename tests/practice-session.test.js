import test from "node:test";
import assert from "node:assert/strict";
import {
  createQuestionResponse,
  createQuestionResponses,
  hasAttempt,
  scoreQuestion,
  scoreSession,
  getQuestionStatus,
  setSubGradeAtIndex,
  updateResponseAtIndex
} from "../src/features/practice-test/session.js";
import {
  clampCurrentIndex,
  clampPracticeMinutes,
  formatPracticeSeconds,
  normalizePracticeQuestionCount
} from "../src/features/practice-test/setup.js";

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

test("createQuestionResponse builds mode-specific response shape", () => {
  assert.deepEqual(createQuestionResponse(mcq), { choiceId: "", skipped: false });
  assert.deepEqual(createQuestionResponse(openText), {
    text: "",
    subGrades: {},
    skipped: false
  });
  assert.deepEqual(createQuestionResponse(mcq, { revealed: false, studyAidsOpen: false }), {
    choiceId: "",
    skipped: false,
    revealed: false,
    studyAidsOpen: false
  });
});

test("createQuestionResponses maps question list to stable response list", () => {
  assert.deepEqual(createQuestionResponses([mcq, openText]), [
    { choiceId: "", skipped: false },
    { text: "", subGrades: {}, skipped: false }
  ]);
});

test("updateResponseAtIndex patches only the selected response", () => {
  const responses = [
    { choiceId: "", skipped: false },
    { text: "", subGrades: {}, skipped: false }
  ];

  assert.deepEqual(updateResponseAtIndex(responses, 0, { choiceId: "a" }), [
    { choiceId: "a", skipped: false },
    { text: "", subGrades: {}, skipped: false }
  ]);
});

test("setSubGradeAtIndex patches only the selected sub grade", () => {
  const responses = [
    { choiceId: "", skipped: false },
    { text: "answer", subGrades: { a: true }, skipped: false }
  ];

  assert.deepEqual(setSubGradeAtIndex(responses, 1, "b", true), [
    { choiceId: "", skipped: false },
    { text: "answer", subGrades: { a: true, b: true }, skipped: false }
  ]);
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

test("practice setup helpers normalize restored controls", () => {
  assert.equal(formatPracticeSeconds(65), "01:05");
  assert.equal(formatPracticeSeconds(-1), "00:00");
  assert.equal(clampPracticeMinutes(Number.NaN), 6);
  assert.equal(clampPracticeMinutes(0), 1);
  assert.equal(clampPracticeMinutes(21), 20);
  assert.equal(normalizePracticeQuestionCount("9"), 10);
  assert.equal(normalizePracticeQuestionCount("18"), 20);
  assert.equal(normalizePracticeQuestionCount("bad"), 10);
  assert.equal(clampCurrentIndex(7, 3), 2);
  assert.equal(clampCurrentIndex(-2, 3), 0);
});
