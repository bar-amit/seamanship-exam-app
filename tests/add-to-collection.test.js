import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeQuestionIds,
  collectionHasQuestion,
  buildCollectionQuestionIds,
  buildCollectionUpdatePayload,
  buildCollectionCreatePayload
} from "../src/features/collections/add-question.js";

test("normalizeQuestionIds trims and deduplicates values", () => {
  assert.deepEqual(normalizeQuestionIds([" q1 ", "q1", "", "q2"]), ["q1", "q2"]);
});

test("collectionHasQuestion matches normalized ids", () => {
  const collection = { question_ids: [" q1 ", "q2"] };
  assert.equal(collectionHasQuestion(collection, "q1"), true);
  assert.equal(collectionHasQuestion(collection, " q2 "), true);
  assert.equal(collectionHasQuestion(collection, "q3"), false);
});

test("buildCollectionQuestionIds appends and deduplicates", () => {
  const collection = { question_ids: ["q1"] };
  assert.deepEqual(buildCollectionQuestionIds(collection, "q2"), ["q1", "q2"]);
  assert.deepEqual(buildCollectionQuestionIds(collection, " q1 "), ["q1"]);
});

test("buildCollectionUpdatePayload keeps collection metadata and merged ids", () => {
  const payload = buildCollectionUpdatePayload(
    { name: "  Set A ", description: "  desc ", question_ids: ["q1"] },
    "q2"
  );
  assert.deepEqual(payload, {
    name: "Set A",
    description: "desc",
    questionIds: ["q1", "q2"]
  });
});

test("buildCollectionCreatePayload normalizes text and question id", () => {
  const payload = buildCollectionCreatePayload({
    name: "  New Set ",
    description: " optional ",
    questionId: " q7 "
  });
  assert.deepEqual(payload, {
    name: "New Set",
    description: "optional",
    questionIds: ["q7"]
  });
});
