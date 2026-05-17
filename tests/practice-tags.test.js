import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeSelectedTags,
  filterQuestionsByTags
} from "../src/features/tag-practice/tags.js";
import {
  buildTagPracticeResetState,
  buildTagPracticeStartState,
  buildTagQuestionsQuery,
  clampTagPracticeCount,
  clampTagPracticeIndex,
  countReviewedResponses,
  getAverageReviewedScore,
  restoreTagPracticeResponses
} from "../src/features/tag-practice/session.js";
import {
  executeListTagPracticeQuestions,
  fetchTagPracticeQuestions,
  normalizeTagQuestionRequest,
  selectTagPracticeQuestions
} from "../src/features/tag-practice/questions.js";

function makeQuestionsDb(questions) {
  return {
    collection(name) {
      assert.equal(name, "questions");
      return {
        async get() {
          return {
            docs: questions.map((question) => ({
              id: question.id,
              data: () => {
                const { id, ...data } = question;
                return data;
              }
            }))
          };
        }
      };
    }
  };
}

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
  assert.equal(clampTagPracticeIndex(-1, 3), 0);
  assert.equal(clampTagPracticeIndex(9, 3), 2);
  assert.deepEqual(restoreTagPracticeResponses(responses).map((r) => r.studyAidsOpen), [
    true,
    false,
    false
  ]);
  assert.equal(countReviewedResponses(responses), 2);
  assert.equal(getAverageReviewedScore(questions, responses), 50);
});

test("buildTagPracticeStartState creates study response state", () => {
  const questions = [
    { type: "mcq", correct_choice_id: "a" },
    { type: "open_text", sub_questions: [{ id: "a" }] }
  ];
  const state = buildTagPracticeStartState(questions);

  assert.equal(state.currentIndex, 0);
  assert.equal(state.questions, questions);
  assert.deepEqual(state.responses, [
    { choiceId: "", skipped: false, revealed: false, studyAidsOpen: false },
    { text: "", subGrades: {}, skipped: false, revealed: false, studyAidsOpen: false }
  ]);
});

test("buildTagPracticeResetState creates setup reset state", () => {
  assert.deepEqual(buildTagPracticeResetState(), {
    questions: [],
    responses: [],
    currentIndex: 0,
    error: ""
  });
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

test("executeListTagPracticeQuestions loads docs and returns tag response payload", async () => {
  const result = await executeListTagPracticeQuestions({
    request: { url: "https://example.test/api/practice/tag-questions?count=1&tags=mechanics" },
    db: makeQuestionsDb([
      { id: "a", text: "A", tags: ["mechanics"] },
      { id: "b", text: "B", tags: ["seamanship"] },
      { id: "c", text: "C", tags: ["mechanics"] }
    ]),
    random: () => 0
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, {
    ok: true,
    requested_tags: ["mechanics"],
    total_pool: 2,
    questions: [{ id: "c", text: "C", tags: ["mechanics"] }]
  });
});

test("fetchTagPracticeQuestions normalizes tags and loads questions through API", async () => {
  const calls = [];
  const result = await fetchTagPracticeQuestions({
    count: 12,
    selectedTags: [" Mechanics ", "mechanics"],
    fetchImpl: async (url) => {
      calls.push(url);
      return {
        ok: true,
        async json() {
          return { ok: true, questions: [{ id: "q1" }] };
        }
      };
    }
  });

  assert.deepEqual(calls, ["/api/practice/tag-questions?count=12&tags=mechanics"]);
  assert.deepEqual(result, {
    questions: [{ id: "q1" }],
    selectedTags: ["mechanics"]
  });
});

test("fetchTagPracticeQuestions serializes all tags and throws fallback errors", async () => {
  const calls = [];
  await assert.rejects(
    () =>
      fetchTagPracticeQuestions({
        count: 30,
        selectedTags: [],
        fallbackError: "Tag fallback",
        fetchImpl: async (url) => {
          calls.push(url);
          return {
            ok: false,
            async json() {
              return { ok: false };
            }
          };
        }
      }),
    /Tag fallback/
  );

  assert.deepEqual(calls, ["/api/practice/tag-questions?count=30&tags=all"]);
});
