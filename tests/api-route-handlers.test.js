import test from "node:test";
import assert from "node:assert/strict";
import {
  getCollectionsHandler,
  postCollectionHandler
} from "../app/api/collections/route.js";
import {
  deleteCollectionHandler,
  putCollectionHandler
} from "../app/api/collections/[id]/route.js";
import { getAdminQuestionsHandler } from "../app/api/admin/questions/route.js";
import {
  getAdminQuestionHandler,
  putAdminQuestionHandler
} from "../app/api/admin/questions/[id]/route.js";

function makeCollectionDb({ docs = [], storedDoc, onSet, onDelete } = {}) {
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

function makeQuestionDoc(id, data) {
  return {
    id,
    data: {
      id,
      ...data
    }
  };
}

function makeQuestionsDb({ docs = [], storedDoc, onSet } = {}) {
  return {
    collection(name) {
      assert.equal(name, "questions");
      return {
        async get() {
          return {
            docs: docs.map((doc) => ({
              id: doc.id,
              data: () => doc.data
            }))
          };
        },
        doc(id) {
          return {
            async get() {
              const doc = storedDoc?.id === id ? storedDoc : docs.find((item) => item.id === id);
              if (!doc) {
                return { exists: false, data: () => null };
              }
              return {
                exists: true,
                id,
                data: () => doc.data
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

function jsonRequest(body, url = "http://app.test/api/test") {
  return {
    url,
    async json() {
      return body;
    }
  };
}

test("collection route handlers use injected auth and db dependencies", async () => {
  const deps = {
    authenticateRequestFn: async () => ({ ok: true, userEmail: "tester@example.com" }),
    db: makeCollectionDb({
      docs: [
        {
          id: "col_1",
          data: {
            owner_email: "tester@example.com",
            name: "Owned",
            updated_at: "2026-05-16T10:00:00.000Z"
          }
        },
        {
          id: "col_2",
          data: {
            owner_email: "other@example.com",
            name: "Other",
            updated_at: "2026-05-17T10:00:00.000Z"
          }
        }
      ]
    })
  };

  const response = await getCollectionsHandler({ url: "http://app.test/api/collections" }, deps);

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    ok: true,
    collections: [
      {
        id: "col_1",
        owner_email: "tester@example.com",
        name: "Owned",
        updated_at: "2026-05-16T10:00:00.000Z"
      }
    ]
  });
});

test("collection mutation route handlers preserve status and body shape", async () => {
  let createdPayload = null;
  let updatedPayload = null;
  let updatedOptions = null;
  let deletedId = null;

  const createResponse = await postCollectionHandler(
    jsonRequest({
      name: "  New collection ",
      description: "  Notes ",
      questionIds: ["q1", " q2 ", "q1"]
    }),
    {
      authenticateRequestFn: async () => ({ ok: true, userEmail: "tester@example.com" }),
      nowIso: "2026-05-17T10:00:00.000Z",
      db: makeCollectionDb({
        onSet(payload) {
          createdPayload = payload;
        }
      })
    }
  );

  assert.equal(createResponse.status, 201);
  assert.equal((await createResponse.json()).collection.name, "New collection");
  assert.equal(createdPayload.owner_email, "tester@example.com");

  const updateResponse = await putCollectionHandler(
    jsonRequest({ name: "Updated", description: "", questionIds: ["q3"] }),
    { params: Promise.resolve({ id: "col_1" }) },
    {
      authenticateRequestFn: async () => ({ ok: true, userEmail: "tester@example.com" }),
      nowIso: "2026-05-17T11:00:00.000Z",
      db: makeCollectionDb({
        storedDoc: {
          id: "col_1",
          data: {
            id: "col_1",
            owner_email: "tester@example.com",
            name: "Old",
            description: "",
            question_ids: ["q1"],
            updated_at: "2026-05-16T10:00:00.000Z"
          }
        },
        onSet(payload, options) {
          updatedPayload = payload;
          updatedOptions = options;
        }
      })
    }
  );

  assert.equal(updateResponse.status, 200);
  assert.equal((await updateResponse.json()).collection.updated_at, "2026-05-17T11:00:00.000Z");
  assert.deepEqual(updatedPayload.question_ids, ["q3"]);
  assert.deepEqual(updatedOptions, { merge: true });

  const deleteResponse = await deleteCollectionHandler(
    { url: "http://app.test/api/collections/col_1" },
    { params: Promise.resolve({ id: "col_1" }) },
    {
      authenticateRequestFn: async () => ({ ok: true, userEmail: "tester@example.com" }),
      db: makeCollectionDb({
        storedDoc: {
          id: "col_1",
          data: {
            id: "col_1",
            owner_email: "tester@example.com",
            name: "Old"
          }
        },
        onDelete(id) {
          deletedId = id;
        }
      })
    }
  );

  assert.equal(deleteResponse.status, 200);
  assert.deepEqual(await deleteResponse.json(), { ok: true });
  assert.equal(deletedId, "col_1");
});

test("admin route handlers use verified-admin dependency boundary", async () => {
  const unauthorizedResponse = await getAdminQuestionsHandler(
    { url: "http://app.test/api/admin/questions" },
    {
      authorizeAdminRequestFn: async () => ({
        ok: false,
        status: 403,
        error: "Admin access required."
      }),
      db: makeQuestionsDb()
    }
  );

  assert.equal(unauthorizedResponse.status, 403);
  assert.deepEqual(await unauthorizedResponse.json(), {
    ok: false,
    error: "Admin access required."
  });

  const authorizedResponse = await getAdminQuestionHandler(
    { url: "http://app.test/api/admin/questions/sq1-q001" },
    { params: Promise.resolve({ id: "sq1-q001" }) },
    {
      authorizeAdminRequestFn: async () => ({ ok: true, userEmail: "admin@example.com" }),
      db: makeQuestionsDb({
        storedDoc: makeQuestionDoc("sq1-q001", {
          type: "mcq",
          chapter: "seamanship",
          text: "Question text"
        })
      })
    }
  );

  assert.equal(authorizedResponse.status, 200);
  assert.equal((await authorizedResponse.json()).question.id, "sq1-q001");
});

test("admin update route handler applies injected timestamp and admin email", async () => {
  let capturedPatch = null;
  let capturedOptions = null;

  const response = await putAdminQuestionHandler(
    jsonRequest({
      text: "  Updated text ",
      tags: "Safety, Safety",
      choices: [
        { id: "A", label: "א", text: "first" },
        { id: "B", label: "ב", text: "second" }
      ],
      correct_choice_id: "B"
    }),
    { params: Promise.resolve({ id: "sq1-q001" }) },
    {
      authorizeAdminRequestFn: async () => ({ ok: true, userEmail: "admin@example.com" }),
      nowIso: "2026-05-17T12:00:00.000Z",
      db: makeQuestionsDb({
        storedDoc: makeQuestionDoc("sq1-q001", {
          type: "mcq",
          chapter: "seamanship",
          text: "Old text",
          choices: [
            { id: "a", label: "א", text: "old first" },
            { id: "b", label: "ב", text: "old second" }
          ],
          correct_choice_id: "a"
        }),
        onSet(payload, options) {
          capturedPatch = payload;
          capturedOptions = options;
        }
      })
    }
  );

  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.question.updated_by, "admin@example.com");
  assert.equal(body.question.updated_at, "2026-05-17T12:00:00.000Z");
  assert.deepEqual(capturedPatch.tags, ["safety"]);
  assert.equal(capturedPatch.correct_choice_id, "b");
  assert.deepEqual(capturedOptions, { merge: true });
});
