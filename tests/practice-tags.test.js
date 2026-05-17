import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeSelectedTags,
  filterQuestionsByTags
} from "../src/features/tag-practice/tags.js";
import {
  buildTagQuestionsQuery,
  clampTagPracticeCount,
  countReviewedResponses,
  getAverageReviewedScore,
  restoreTagPracticeResponses
} from "../src/features/tag-practice/session.js";
import {
  normalizeTagQuestionRequest,
  selectTagPracticeQuestions
} from "../src/features/tag-practice/questions.js";

test("normalizeSelectedTags returns empty filter when all is selected", () => {
  assert.deepEqual(normalizeSelectedTags(["all", "seamanship"]), []);
});

test("normalizeSelectedTags normalizes case and duplicates", () => {
  assert.deepEqual(normalizeSelectedTags(["Seamanship", "seamanship", " mechanics "]), [
    "seamanship",
    "mechanics"
  ]);
});

test("filterQuestionsByTags returns only matching tags", () => {
  const questions = [
    { id: "q1", tags: ["seamanship"] },
    { id: "q2", tags: ["navigation a"] },
    { id: "q3", tags: ["mechanics"] }
  ];
  const filtered = filterQuestionsByTags(questions, ["navigation a", "mechanics"]);
  assert.deepEqual(
    filtered.map((q) => q.id),
    ["q2", "q3"]
  );
});

test("tag practice session helpers normalize restored state and reviewed score", () => {
  const questions = [
    { type: "mcq", correct_choice_id: "a" },
    { type: "mcq", correct_choice_id: "b" },
    { type: "mcq", correct_choice_id: "c" }
  ];
  const responses = [
    { choiceId: "a", revealed: true, studyAidsOpen: "yes" },
    { choiceId: "x", skipped: true },
    { choiceId: "c" }
  ];

  assert.equal(clampTagPracticeCount(3), 5);
  assert.equal(clampTagPracticeCount(201), 200);
  assert.deepEqual(restoreTagPracticeResponses(responses).map((r) => r.studyAidsOpen), [
    true,
    false,
    false
  ]);
  assert.equal(countReviewedResponses(responses), 2);
  assert.equal(getAverageReviewedScore(questions, responses), 50);
});

test("buildTagQuestionsQuery serializes all and selected tags", () => {
  assert.equal(buildTagQuestionsQuery({ count: 30, selectedTags: [] }).toString(), "count=30&tags=all");
  assert.equal(
    buildTagQuestionsQuery({ count: 12, selectedTags: ["navigation a", "safety"] }).toString(),
    "count=12&tags=navigation+a%2Csafety"
  );
});

test("tag question API helpers normalize request and select filtered randomized questions", () => {
  assert.deepEqual(normalizeTagQuestionRequest({ countParam: "bad", tagsParam: "all" }), {
    count: 30,
    selectedTags: []
  });
  assert.deepEqual(normalizeTagQuestionRequest({ countParam: "250", tagsParam: " Mechanics, mechanics " }), {
    count: 200,
    selectedTags: ["mechanics"]
  });

  const selection = selectTagPracticeQuestions(
    [
      { id: "a", tags: ["mechanics"] },
      { id: "b", tags: ["seamanship"] },
      { id: "c", tags: ["mechanics"] }
    ],
    { count: 1, selectedTags: ["mechanics"], random: () => 0 }
  );

  assert.equal(selection.totalPool, 2);
  assert.deepEqual(selection.requestedTags, ["mechanics"]);
  assert.deepEqual(
    selection.questions.map((question) => question.id),
    ["c"]
  );
});
