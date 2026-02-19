import test from "node:test";
import assert from "node:assert/strict";
import { normalizeCollectionInput, buildCollectionDoc } from "../src/lib/collections/schema.js";

test("normalizeCollectionInput validates name and de-duplicates question ids", () => {
  const out = normalizeCollectionInput({
    name: "  Navigation Weak  ",
    description: "  hard questions ",
    questionIds: ["q1", "q1", " q2 "]
  });
  assert.equal(out.name, "Navigation Weak");
  assert.equal(out.description, "hard questions");
  assert.deepEqual(out.questionIds, ["q1", "q2"]);
});

test("normalizeCollectionInput throws when name is empty", () => {
  assert.throws(() => normalizeCollectionInput({ name: "  " }), /required/);
});

test("buildCollectionDoc creates stable structure", () => {
  const doc = buildCollectionDoc({
    id: "col_1",
    ownerEmail: "user@example.com",
    name: "A",
    description: "",
    questionIds: ["q1"],
    nowIso: "2026-02-19T00:00:00Z"
  });
  assert.equal(doc.id, "col_1");
  assert.equal(doc.owner_email, "user@example.com");
  assert.equal(doc.created_at, "2026-02-19T00:00:00Z");
});
