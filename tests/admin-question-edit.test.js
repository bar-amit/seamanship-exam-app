import test from "node:test";
import assert from "node:assert/strict";
import { normalizeAdminQuestionUpdate } from "../src/features/admin/question-edit.js";

test("normalizeAdminQuestionUpdate normalizes text, model answer and tags", () => {
  const existing = {
    id: "sq1-q001",
    type: "mcq",
    chapter: "navigation_a",
    text: "old",
    model_answer: "old explain",
    tags: ["navigation a"],
    choices: [
      { id: "a", label: "א", text: "one" },
      { id: "b", label: "ב", text: "two" }
    ],
    correct_choice_id: "a"
  };

  const out = normalizeAdminQuestionUpdate(
    {
      text: "  Updated text  ",
      model_answer: "  Updated explanation ",
      tags: "Navigation A, seamanship, seamanship"
    },
    existing
  );

  assert.equal(out.text, "Updated text");
  assert.equal(out.model_answer, "Updated explanation");
  assert.deepEqual(out.tags, ["navigation a", "seamanship"]);
  assert.deepEqual(out.choices, [
    { id: "a", label: "א", text: "one", image_ref: null, image_storage_path: null },
    { id: "b", label: "ב", text: "two", image_ref: null, image_storage_path: null }
  ]);
  assert.equal(out.correct_choice_id, "a");
});

test("normalizeAdminQuestionUpdate validates mcq correct choice id", () => {
  const existing = {
    id: "sq1-q002",
    type: "mcq",
    text: "q",
    choices: [
      { id: "a", label: "א", text: "one" },
      { id: "b", label: "ב", text: "two" }
    ],
    correct_choice_id: "a"
  };

  assert.throws(
    () =>
      normalizeAdminQuestionUpdate(
        {
          text: "q",
          choices: [
            { id: "a", text: "first" },
            { id: "b", text: "second" }
          ],
          correct_choice_id: "c"
        },
        existing
      ),
    /must match/i
  );
});

test("normalizeAdminQuestionUpdate normalizes open-text sub questions", () => {
  const existing = {
    id: "sq2-q010",
    type: "open_text",
    chapter: "navigation_a",
    text: "q",
    sub_questions: [{ id: "a", label: "א", text: "old", order: 1 }]
  };

  const out = normalizeAdminQuestionUpdate(
    {
      text: "q",
      sub_questions: [
        { id: "A", label: "", text: " first ", order: "2" },
        { id: "", label: "", text: "second", order: null },
        { id: "c", text: "   " }
      ]
    },
    existing
  );

  assert.deepEqual(out.sub_questions, [
    { id: "a", label: "א", text: "first", order: 2 },
    { id: "b", label: "ב", text: "second", order: 1 }
  ]);
});

test("normalizeAdminQuestionUpdate throws on missing required fields", () => {
  const existing = {
    id: "sq2-q010",
    type: "open_text",
    chapter: "navigation_a",
    text: "q"
  };

  assert.throws(
    () =>
      normalizeAdminQuestionUpdate(
        {
          text: " ",
          sub_questions: []
        },
        existing
      ),
    /required/i
  );
});

test("normalizeAdminQuestionUpdate allows open-text single-prompt questions without sub questions", () => {
  const out = normalizeAdminQuestionUpdate(
    {
      text: "valid",
      sub_questions: []
    },
    {
      id: "sq4-q096",
      type: "open_text",
      chapter: "navigation_a",
      text: "old",
      model_answer: "answer"
    }
  );

  assert.deepEqual(out.sub_questions, []);
});

test("normalizeAdminQuestionUpdate normalizes question image metadata", () => {
  const out = normalizeAdminQuestionUpdate(
    {
      text: "question",
      image_refs: " sq11-images/image_36.jpg\nsq3-inline-images/map-01.jpg\nsq11-images/image_36.jpg ",
      references_sq11_positioning_diagram: true
    },
    {
      id: "sq3-q001",
      type: "mcq",
      chapter: "seamanship",
      text: "old",
      choices: [
        { id: "a", label: "א", text: "one" },
        { id: "b", label: "ב", text: "two" }
      ],
      correct_choice_id: "a"
    }
  );

  assert.deepEqual(out.image_refs, ["sq11-images/image_36.jpg", "sq3-inline-images/map-01.jpg"]);
  assert.deepEqual(out.image_storage_paths, [
    "question-assets/sq11-images/image_36.jpg",
    "question-assets/sq3-inline-images/map-01.jpg"
  ]);
  assert.equal(out.image_ref, "sq11-images/image_36.jpg");
  assert.equal(out.image_storage_path, "question-assets/sq11-images/image_36.jpg");
  assert.equal(out.references_sq11_positioning_diagram, true);
});

test("normalizeAdminQuestionUpdate aligns sub answers to normalized sub questions", () => {
  const out = normalizeAdminQuestionUpdate(
    {
      text: "q",
      sub_questions: [
        { id: "A", label: "", text: " first ", order: "2" },
        { id: "", label: "", text: "second", order: null }
      ],
      sub_answers: [
        { text: " first answer " },
        { text: "second answer" }
      ]
    },
    {
      id: "sq4-q010",
      type: "open_text",
      chapter: "navigation_a",
      text: "old",
      model_answer: "answer"
    }
  );

  assert.deepEqual(out.sub_answers, [
    { id: "a", label: "א", text: "first answer", order: 2 },
    { id: "b", label: "ב", text: "second answer", order: 1 }
  ]);
});
