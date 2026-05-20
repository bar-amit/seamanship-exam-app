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

test("normalizeQuestionForImport includes q96 from improved extracted data", () => {
  const q = {
    id: "sq4-q096",
    chapter: "navigation_a",
    type: "open_text",
    text: "prompt",
    tags: [],
    choices: [],
    model_answer: "answer"
  };
  const normalized = normalizeQuestionForImport(q);
  assert.equal(normalized.id, "sq4-q096");
});

test("normalizeQuestionForImport backfills sq3 image ref and description from legacy maps", () => {
  const q = {
    id: "sq3-q001",
    source_file: "sq3",
    question_number: 1,
    chapter: "seamanship",
    type: "mcq",
    choices: [],
    tags: [],
    image_ref: null
  };

  const normalized = normalizeQuestionForImport(q, {
    sq3AssetByQuestionNumber: { "1": "image_36.jpg" },
    legacyImageDescriptionByFile: { "image_36.jpg": "desc" },
    storagePrefix: "question-assets"
  });

  assert.equal(normalized.image_ref, "legacy-images/image_36.jpg");
  assert.equal(normalized.image_storage_path, "question-assets/legacy-images/image_36.jpg");
  assert.equal(normalized.image_description, "desc");
});

test("collectReferencedAssets and upload plan include question + choice refs", () => {
  const questions = [
    {
      id: "q1",
      image_ref: "images/q1.jpg",
      image_refs: ["images/q1.jpg", "images/q1-detail.jpg"],
      choices: [{ id: "a", image_ref: "choices/q1-a.jpg" }],
      references_sq11_positioning_diagram: true
    }
  ];

  const refs = collectReferencedAssets(questions);
  assert.deepEqual(refs, ["choices/q1-a.jpg", "images/q1-detail.jpg", "images/q1.jpg", "position_diagram.png"]);

  const plan = buildAssetUploadPlan(refs, "test_material/data/assets", "question-assets");
  assert.equal(plan[0].destinationPath, "question-assets/choices/q1-a.jpg");
});

test("normalizeQuestionForImport preserves multi-image and open-answer metadata", () => {
  const normalized = normalizeQuestionForImport(
    {
      id: "sq4-q001",
      question_number: 1,
      chapter: "navigation_a",
      type: "open_text",
      text: "prompt",
      tags: [],
      choices: [],
      image_ref: "sq11-images/image_36.jpg",
      image_refs: ["sq11-images/image_36.jpg", "sq3-inline-images/map-01.jpg"],
      sub_questions: [{ id: "a", label: "א", text: "Explain", order: 1 }],
      sub_answers: [{ id: "a", label: "א", text: "Answer", order: 1 }],
      model_answer: "Answer",
      references_sq11_positioning_diagram: true
    },
    { storagePrefix: "question-assets" }
  );

  assert.deepEqual(normalized.image_refs, ["sq11-images/image_36.jpg", "sq3-inline-images/map-01.jpg"]);
  assert.deepEqual(normalized.image_storage_paths, [
    "question-assets/sq11-images/image_36.jpg",
    "question-assets/sq3-inline-images/map-01.jpg"
  ]);
  assert.deepEqual(normalized.sub_answers, [{ id: "a", label: "א", text: "Answer", order: 1 }]);
  assert.equal(normalized.references_sq11_positioning_diagram, true);
});

test("normalizeQuestionForImport makes sub-question and sub-answer ids unique by order", () => {
  const normalized = normalizeQuestionForImport({
    id: "sq4-q003",
    chapter: "navigation_a",
    type: "open_text",
    text: "prompt",
    tags: [],
    choices: [],
    sub_questions: [
      { id: "b", label: "ב", text: "first", order: 1 },
      { id: "b", label: "ב", text: "second", order: 2 }
    ],
    sub_answers: [
      { id: "b", label: "ב", text: "first answer", order: 1 },
      { id: "b", label: "ב", text: "second answer", order: 2 }
    ],
    model_answer: "answer"
  });

  assert.deepEqual(
    normalized.sub_questions.map((sub) => [sub.id, sub.label, sub.order]),
    [
      ["a", "א", 1],
      ["b", "ב", 2]
    ]
  );
  assert.deepEqual(
    normalized.sub_answers.map((sub) => [sub.id, sub.label, sub.order]),
    [
      ["a", "א", 1],
      ["b", "ב", 2]
    ]
  );
});
