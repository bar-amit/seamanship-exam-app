import test from "node:test";
import assert from "node:assert/strict";
import { validateImportQuestion, validateImportQuestions } from "../src/lib/import/validate.js";

const validMcq = {
  id: "sq3-q001",
  type: "mcq",
  text: "prompt",
  chapter: "seamanship",
  tags: ["seamanship"],
  choices: [
    { id: "a", text: "wrong", image_ref: null },
    { id: "b", text: "right", image_ref: "choices/b.jpg", image_storage_path: "question-assets/choices/b.jpg" }
  ],
  correct_choice_id: "b"
};

const validOpenText = {
  id: "sq4-q001",
  type: "open_text",
  text: "prompt",
  chapter: "navigation_a",
  tags: ["navigation a"],
  choices: [],
  correct_choice_id: null,
  sub_questions: [{ id: "a", label: "a", text: "Explain", order: 1 }],
  model_answer: "model answer"
};

test("validateImportQuestion accepts supported normalized question shapes", () => {
  assert.equal(validateImportQuestion(validMcq).ok, true);
  assert.equal(validateImportQuestion(validOpenText).ok, true);
});

test("validateImportQuestion rejects invalid MCQ answer wiring", () => {
  const result = validateImportQuestion({ ...validMcq, correct_choice_id: "z" });

  assert.equal(result.ok, false);
  assert.equal(result.errors.some((error) => error.code === "correct_choice_not_found"), true);
});

test("validateImportQuestion rejects open_text without model answers and warns on missing subquestions", () => {
  const result = validateImportQuestion({ ...validOpenText, sub_questions: [], model_answer: "" });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((error) => error.code), ["missing_model_answer"]);
  assert.deepEqual(result.warnings.map((warning) => warning.code), ["missing_sub_questions"]);
});

test("validateImportQuestions reports duplicate question ids across the batch", () => {
  const result = validateImportQuestions([validMcq, { ...validOpenText, id: validMcq.id }]);

  assert.equal(result.ok, false);
  assert.equal(result.total, 2);
  assert.equal(result.errors.some((error) => error.code === "duplicate_question_id"), true);
});

test("validateImportQuestion warns on missing chapter metadata", () => {
  const result = validateImportQuestion({ ...validMcq, chapter: "" });

  assert.equal(result.ok, true);
  assert.equal(result.warnings.some((warning) => warning.code === "missing_chapter"), true);
});
