import test from "node:test";
import assert from "node:assert/strict";
import { executePutCollection } from "../src/lib/collections/route-put.js";

function makeDb({ storedDoc, onSet }) {
  return {
    collection(name) {
      assert.equal(name, "collections");
      return {
        doc(id) {
          return {
            async get() {
              if (!storedDoc || storedDoc.id !== id) {
                return { exists: false, data: () => null };
              }
              return {
                exists: true,
                id,
                data: () => storedDoc.data
              };
            },
            async set(payload, options) {
              onSet?.(payload, options);
            }
          };
        }
      };
    }
  };
}

test("executePutCollection returns auth status when request is unauthorized", async () => {
  const result = await executePutCollection({
    request: { json: async () => ({}) },
    params: Promise.resolve({ id: "col_1" }),
    authFn: async () => ({ ok: false, status: 401, error: "Unauthorized" }),
    db: makeDb({}),
    nowIso: "2026-02-27T10:00:00.000Z"
  });

  assert.equal(result.status, 401);
  assert.equal(result.body.ok, false);
  assert.equal(result.body.error, "Unauthorized");
});

test("executePutCollection persists deduplicated question ids", async () => {
  let capturedPayload = null;
  let capturedOptions = null;

  const result = await executePutCollection({
    request: {
      async json() {
        return {
          name: "  אוסף ניווט ",
          description: "  תרגול ",
          questionIds: ["q1", " q2 ", "q1", "q2"]
        };
      }
    },
    params: Promise.resolve({ id: "col_1" }),
    authFn: async () => ({ ok: true, userEmail: "tester@example.com" }),
    nowIso: "2026-02-27T10:00:00.000Z",
    db: makeDb({
      storedDoc: {
        id: "col_1",
        data: {
          id: "col_1",
          owner_email: "tester@example.com",
          name: "old",
          description: "old",
          question_ids: ["q1"],
          updated_at: "2026-02-20T10:00:00.000Z"
        }
      },
      onSet(payload, options) {
        capturedPayload = payload;
        capturedOptions = options;
      }
    })
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  assert.deepEqual(capturedPayload.question_ids, ["q1", "q2"]);
  assert.equal(capturedPayload.name, "אוסף ניווט");
  assert.equal(capturedPayload.description, "תרגול");
  assert.equal(capturedPayload.updated_at, "2026-02-27T10:00:00.000Z");
  assert.deepEqual(capturedOptions, { merge: true });
});
