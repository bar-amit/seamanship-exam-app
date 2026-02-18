import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSq5ChoiceImageMap,
  normalizeQuestionForImport,
  collectReferencedAssets,
  buildAssetUploadPlan
} from "../src/lib/import/normalize.js";

test("normalizeQuestionForImport keeps open_text and applies fallback chapter tag", () => {
  const q = {
    id: "sq4-q001",
    question_number: 1,
    subject: "navigation",
    chapter: "navigation_a",
    type: "open_text",
    text: "prompt",
    choices: [],
    correct_choice_id: null,
    tags: [],
    image_ref: null,
    sub_questions: []
  };

  const normalized = normalizeQuestionForImport(q, {});
  assert.equal(normalized.type, "open_text");
  assert.deepEqual(normalized.tags, ["navigation a"]);
});

test("normalizeQuestionForImport injects sq5 per-choice image refs from manifest map", () => {
  const manifest = {
    files: {
      "102": {
        a: "sq5-option-images/q102-a.jpg",
        b: "sq5-option-images/q102-b.jpg"
      }
    }
  };

  const map = buildSq5ChoiceImageMap(manifest);
  const q = {
    id: "sq5-q102",
    source_file: "sq5",
    question_number: 102,
    chapter: "navigation_b",
    type: "mcq",
    choices: [
      { id: "a", label: "א", text: "איור א", image_ref: null },
      { id: "b", label: "ב", text: "איור ב", image_ref: null }
    ],
    tags: [],
    image_ref: null
  };

  const normalized = normalizeQuestionForImport(q, {
    sq5ChoiceImageMap: map,
    storagePrefix: "question-assets"
  });

  assert.equal(normalized.choices[0].image_ref, "sq5-option-images/q102-a.jpg");
  assert.equal(normalized.choices[0].image_storage_path, "question-assets/sq5-option-images/q102-a.jpg");
  assert.equal(normalized.choices[1].image_ref, "sq5-option-images/q102-b.jpg");
});

test("normalizeQuestionForImport skips q96 safety rule", () => {
  const q = {
    id: "sq4-q096",
    chapter: "navigation_a",
    type: "open_text",
    tags: [],
    choices: []
  };
  const normalized = normalizeQuestionForImport(q);
  assert.equal(normalized, null);
});

test("collectReferencedAssets and upload plan include question + choice refs", () => {
  const questions = [
    {
      id: "q1",
      image_ref: "images/q1.jpg",
      choices: [{ id: "a", image_ref: "choices/q1-a.jpg" }]
    }
  ];

  const refs = collectReferencedAssets(questions);
  assert.deepEqual(refs, ["choices/q1-a.jpg", "images/q1.jpg"]);

  const plan = buildAssetUploadPlan(refs, "test_material/data/assets", "question-assets");
  assert.equal(plan[0].destinationPath, "question-assets/choices/q1-a.jpg");
});
