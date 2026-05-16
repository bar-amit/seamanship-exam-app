import test from "node:test";
import assert from "node:assert/strict";
import {
  executeCreateCollection,
  executeDeleteCollection,
  executeListCollections,
  executeUpdateCollection
} from "../src/features/collections/service.js";

function makeDb({ docs = [], storedDoc, onSet, onDelete } = {}) {
  return {
    collection(name) {
      assert.equal(name, "collections");
      return {
        where(field, operator, value) {
          assert.equal(field, "owner_email");
          assert.equal(operator, "==");
          return {
            async get() {
              return {
                docs: docs
                  .filter((doc) => doc.data.owner_email === value)
                  .map((doc) => ({
                    id: doc.id,
                    data: () => doc.data
                  }))
              };
            }
          };
        },
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
            },
            async delete() {
              onDelete?.(id);
            }
          };
        }
      };
    }
  };
}

test("executeListCollections returns auth status when request is unauthorized", async () => {
  const result = await executeListCollections({
    request: {},
    authFn: async () => ({ ok: false, status: 401, error: "Unauthorized" }),
    db: makeDb()
  });

  assert.equal(result.status, 401);
  assert.equal(result.body.ok, false);
  assert.equal(result.body.error, "Unauthorized");
});

test("executeListCollections returns only owned collections sorted by update time", async () => {
  const result = await executeListCollections({
    request: {},
    authFn: async () => ({ ok: true, userEmail: "tester@example.com" }),
    db: makeDb({
      docs: [
        {
          id: "col_old",
          data: {
            owner_email: "tester@example.com",
            name: "old",
            updated_at: "2026-02-20T10:00:00.000Z"
          }
        },
        {
          id: "col_other",
          data: {
            owner_email: "other@example.com",
            name: "other",
            updated_at: "2026-02-22T10:00:00.000Z"
          }
        },
        {
          id: "col_new",
          data: {
            owner_email: "tester@example.com",
            name: "new",
            updated_at: "2026-02-22T10:00:00.000Z"
          }
        }
      ]
    })
  });

  assert.equal(result.status, 200);
  assert.deepEqual(
    result.body.collections.map((collection) => collection.id),
    ["col_new", "col_old"]
  );
});

test("executeCreateCollection persists normalized collection doc", async () => {
  let capturedPayload = null;

  const result = await executeCreateCollection({
    request: {
      async json() {
        return {
          name: "  אוסף חדש ",
          description: "  תיאור ",
          questionIds: ["q1", " q2 ", "q1"]
        };
      }
    },
    authFn: async () => ({ ok: true, userEmail: "tester@example.com" }),
    nowIso: "2026-02-27T10:00:00.000Z",
    createId: () => "col_created",
    db: makeDb({
      onSet(payload) {
        capturedPayload = payload;
      }
    })
  });

  assert.equal(result.status, 201);
  assert.equal(result.body.ok, true);
  assert.equal(capturedPayload.id, "col_created");
  assert.equal(capturedPayload.owner_email, "tester@example.com");
  assert.equal(capturedPayload.name, "אוסף חדש");
  assert.equal(capturedPayload.description, "תיאור");
  assert.deepEqual(capturedPayload.question_ids, ["q1", "q2"]);
});

test("executeUpdateCollection returns auth status when request is unauthorized", async () => {
  const result = await executeUpdateCollection({
    request: { json: async () => ({}) },
    params: Promise.resolve({ id: "col_1" }),
    authFn: async () => ({ ok: false, status: 401, error: "Unauthorized" }),
    db: makeDb(),
    nowIso: "2026-02-27T10:00:00.000Z"
  });

  assert.equal(result.status, 401);
  assert.equal(result.body.ok, false);
  assert.equal(result.body.error, "Unauthorized");
});

test("executeUpdateCollection persists deduplicated question ids", async () => {
  let capturedPayload = null;
  let capturedOptions = null;

  const result = await executeUpdateCollection({
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

test("executeDeleteCollection deletes only owned collections", async () => {
  let deletedId = null;

  const result = await executeDeleteCollection({
    request: {},
    params: Promise.resolve({ id: "col_1" }),
    authFn: async () => ({ ok: true, userEmail: "tester@example.com" }),
    db: makeDb({
      storedDoc: {
        id: "col_1",
        data: {
          id: "col_1",
          owner_email: "tester@example.com",
          name: "old"
        }
      },
      onDelete(id) {
        deletedId = id;
      }
    })
  });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.equal(deletedId, "col_1");
});

test("executeDeleteCollection hides collections owned by another user", async () => {
  let deletedId = null;

  const result = await executeDeleteCollection({
    request: {},
    params: Promise.resolve({ id: "col_1" }),
    authFn: async () => ({ ok: true, userEmail: "tester@example.com" }),
    db: makeDb({
      storedDoc: {
        id: "col_1",
        data: {
          id: "col_1",
          owner_email: "other@example.com",
          name: "old"
        }
      },
      onDelete(id) {
        deletedId = id;
      }
    })
  });

  assert.equal(result.status, 404);
  assert.equal(result.body.ok, false);
  assert.equal(deletedId, null);
});
