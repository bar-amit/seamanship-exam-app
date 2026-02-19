import test from "node:test";
import assert from "node:assert/strict";
import { normalizeAdminQuestionUpdate } from "../src/lib/admin/question-edit.js";

test("normalizeAdminQuestionUpdate normalizes text, model answer and tags", () => {
  const existing = {
    id: "sq1-q001",
    type: "mcq",
    chapter: "navigation_a",
    text: "old",
    model_answer: "old explain",
    tags: ["navigation a"]
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

  assert.throws(
    () =>
      normalizeAdminQuestionUpdate(
        {
          text: "valid",
          sub_questions: []
        },
        existing
      ),
    /sub-question/i
  );
});
