import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeTagProgressSnapshot,
  buildTagProgressDoc,
  executeGetTagProgress,
  executePutTagProgress
} from "../src/features/tag-practice/progress.js";

function makeDb(initialDocs = {}) {
  const writes = [];

  return {
    writes,
    collection(name) {
      assert.equal(name, "tag_progress");
      return {
        doc(id) {
          return {
            async get() {
              const data = initialDocs[id];
              return {
                exists: Boolean(data),
                data: () => data
              };
            },
            async set(data, options) {
              writes.push({ id, data, options });
              initialDocs[id] = data;
            }
          };
        }
      };
    }
  };
}

function makeJsonRequest(body) {
  return {
    async json() {
      return body;
    }
  };
}

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

test("executeGetTagProgress returns auth failures unchanged", async () => {
  const result = await executeGetTagProgress({
    request: {},
    db: makeDb(),
    authFn: async () => ({ ok: false, status: 401, error: "Authentication required." })
  });

  assert.deepEqual(result, {
    status: 401,
    body: { ok: false, error: "Authentication required." }
  });
});

test("executeGetTagProgress hides missing or foreign progress docs", async () => {
  const missing = await executeGetTagProgress({
    request: {},
    db: makeDb(),
    authFn: async () => ({ ok: true, userEmail: "user@example.com" })
  });
  assert.deepEqual(missing, { status: 200, body: { ok: true, progress: null } });

  const foreign = await executeGetTagProgress({
    request: {},
    db: makeDb({
      "user@example.com": { owner_email: "other@example.com", questionCount: 3 }
    }),
    authFn: async () => ({ ok: true, userEmail: "user@example.com" })
  });
  assert.deepEqual(foreign, { status: 200, body: { ok: true, progress: null } });
});

test("executeGetTagProgress returns owned progress doc", async () => {
  const progress = { owner_email: "user@example.com", questionCount: 3 };
  const result = await executeGetTagProgress({
    request: {},
    db: makeDb({ "user@example.com": progress }),
    authFn: async () => ({ ok: true, userEmail: "user@example.com" })
  });

  assert.deepEqual(result, {
    status: 200,
    body: { ok: true, progress }
  });
});

test("executePutTagProgress normalizes and persists progress doc", async () => {
  const db = makeDb();
  const result = await executePutTagProgress({
    request: makeJsonRequest({
      selectedTags: [" Mechanics "],
      questionCount: 4,
      reviewedCount: 9,
      averageReviewedScore: 120
    }),
    db,
    nowIso: "2026-02-19T12:00:00.000Z",
    authFn: async () => ({ ok: true, userEmail: "USER@Example.COM".toLowerCase() })
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.progress.owner_email, "user@example.com");
  assert.deepEqual(result.body.progress.selectedTags, ["mechanics"]);
  assert.equal(result.body.progress.reviewedCount, 4);
  assert.equal(result.body.progress.averageReviewedScore, 100);
  assert.deepEqual(db.writes, [
    {
      id: "user@example.com",
      data: result.body.progress,
      options: { merge: true }
    }
  ]);
});
