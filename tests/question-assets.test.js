import test from "node:test";
import assert from "node:assert/strict";
import { getChoiceImageRefs, getQuestionImageItems } from "../src/features/questions/assets.js";
import { getSubAnswerForQuestion } from "../src/features/practice-test/open-text.js";

test("getQuestionImageItems returns ordered image_refs with storage paths", () => {
  const items = getQuestionImageItems({
    image_ref: "sq11-images/image_1.jpg",
    image_refs: ["sq11-images/image_1.jpg", "sq3-inline-images/map-01.jpg"],
    image_storage_paths: [
      "question-assets/sq11-images/image_1.jpg",
      "question-assets/sq3-inline-images/map-01.jpg"
    ],
    choices: []
  });

  assert.deepEqual(items, [
    {
      imageRef: "sq11-images/image_1.jpg",
      imageStoragePath: "question-assets/sq11-images/image_1.jpg"
    },
    {
      imageRef: "sq3-inline-images/map-01.jpg",
      imageStoragePath: "question-assets/sq3-inline-images/map-01.jpg"
    }
  ]);
});

test("getQuestionImageItems excludes choice images to avoid duplicate rendering", () => {
  const question = {
    image_ref: "sq11-images/image_66.jpg",
    image_refs: ["sq11-images/image_66.jpg", "sq11-images/image_2.jpg", "sq11-images/image_25.jpg"],
    image_storage_paths: [
      "question-assets/sq11-images/image_66.jpg",
      "question-assets/sq11-images/image_2.jpg",
      "question-assets/sq11-images/image_25.jpg"
    ],
    choices: [
      { id: "a", image_ref: "sq11-images/image_66.jpg" },
      { id: "b", image_ref: "sq11-images/image_2.jpg" }
    ]
  };

  assert.deepEqual(getChoiceImageRefs(question), new Set(["sq11-images/image_66.jpg", "sq11-images/image_2.jpg"]));
  assert.deepEqual(getQuestionImageItems(question), [
    {
      imageRef: "sq11-images/image_25.jpg",
      imageStoragePath: "question-assets/sq11-images/image_25.jpg"
    }
  ]);
});

test("getQuestionImageItems falls back to legacy image_ref", () => {
  assert.deepEqual(getQuestionImageItems({ image_ref: "legacy-images/image_36.jpg" }), [
    {
      imageRef: "legacy-images/image_36.jpg",
      imageStoragePath: "question-assets/legacy-images/image_36.jpg"
    }
  ]);
});

test("getSubAnswerForQuestion prefers order alignment and falls back to id", () => {
  const question = {
    sub_answers: [
      { id: "a", text: "first" },
      { id: "b", text: "second" }
    ]
  };

  assert.equal(getSubAnswerForQuestion(question, { id: "b" }, 0).text, "first");
  assert.equal(getSubAnswerForQuestion(question, { id: "b" }, 5).text, "second");
  assert.equal(getSubAnswerForQuestion({}, { id: "a" }, 0), null);
});
