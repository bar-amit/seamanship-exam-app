import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeSelectedTags,
  filterQuestionsByTags
} from "../src/lib/practice/tags.js";

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
