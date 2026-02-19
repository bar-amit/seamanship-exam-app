import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeTagProgressSnapshot,
  buildTagProgressDoc
} from "../src/lib/progress/tag-progress.js";

test("normalizeTagProgressSnapshot normalizes tags and clamps values", () => {
  const out = normalizeTagProgressSnapshot({
    selectedTags: [" Navigation A ", "navigation a", ""],
    questionCount: 10,
    reviewedCount: 12,
    averageReviewedScore: 120,
    perTag: [
      { tag: "Navigation A", attempts: "2", averageScore: 70.2 },
      { tag: "navigation a", attempts: 3, averageScore: 80.4 },
      { tag: "mechanics", attempts: -1, averageScore: -3 }
    ]
  });

  assert.equal(out.mode, "tag_practice");
  assert.deepEqual(out.selectedTags, ["navigation a"]);
  assert.equal(out.reviewedCount, 10);
  assert.equal(out.averageReviewedScore, 100);
  assert.deepEqual(out.perTag, [
    { tag: "navigation a", attempts: 3, averageScore: 80.4 },
    { tag: "mechanics", attempts: 0, averageScore: 0 }
  ]);
});

test("buildTagProgressDoc merges ownership and timestamps", () => {
  const snapshot = normalizeTagProgressSnapshot({
    selectedTags: ["seamanship"],
    questionCount: 5,
    reviewedCount: 3
  });
  const doc = buildTagProgressDoc({
    ownerEmail: "USER@EXAMPLE.COM",
    snapshot,
    nowIso: "2026-02-19T12:00:00.000Z"
  });

  assert.equal(doc.owner_email, "user@example.com");
  assert.equal(doc.mode, "tag_practice");
  assert.equal(doc.updated_at, "2026-02-19T12:00:00.000Z");
});
