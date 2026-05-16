import test from "node:test";
import assert from "node:assert/strict";
import {
  executeGetAdminQuestion,
  executeListAdminQuestions,
  executeUpdateAdminQuestion
} from "../src/lib/admin/service.js";

function makeQuestionDoc(id, data) {
  return {
    id,
    data: {
      id,
      ...data
    }
  };
}

function makeDb({ docs = [], storedDoc, onSet } = {}) {
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

test("executeListAdminQuestions returns auth status when request is unauthorized", async () => {
  const result = await executeListAdminQuestions({
    request: { url: "http://app.test/api/admin/questions" },
    authFn: async () => ({ ok: false, status: 403, error: "Admin access required." }),
    db: makeDb()
  });

  assert.equal(result.status, 403);
  assert.deepEqual(result.body, { ok: false, error: "Admin access required." });
});

test("executeListAdminQuestions filters, sorts and paginates previews", async () => {
  const result = await executeListAdminQuestions({
    request: {
      url: "http://app.test/api/admin/questions?query=anchor&page=2&pageSize=1"
    },
    authFn: async () => ({ ok: true, userEmail: "admin@example.com" }),
    db: makeDb({
      docs: [
        makeQuestionDoc("sq2-q010", {
          type: "open_text",
          chapter: "navigation_a",
          text: "Anchor plotting question",
          tags: ["navigation a"],
          updated_at: "2026-02-20T10:00:00.000Z",
          updated_by: "admin@example.com"
        }),
        makeQuestionDoc("sq1-q001", {
          type: "mcq",
          chapter: "seamanship",
          text: "Anchor safety question",
          tags: ["seamanship"]
        }),
        makeQuestionDoc("sq3-q050", {
          type: "mcq",
          chapter: "mechanics",
          text: "Engine question"
        })
      ]
    })
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.page, 2);
  assert.equal(result.body.pageSize, 1);
  assert.equal(result.body.total, 2);
  assert.equal(result.body.totalPages, 2);
  assert.equal(result.body.count, 1);
  assert.deepEqual(result.body.questions, [
    {
      id: "sq2-q010",
      type: "open_text",
      chapter: "navigation_a",
      text: "Anchor plotting question",
      text_preview: "Anchor plotting question",
      tags: ["navigation a"],
      updated_at: "2026-02-20T10:00:00.000Z",
      updated_by: "admin@example.com"
    }
  ]);
});

test("executeGetAdminQuestion returns loaded question document", async () => {
  const result = await executeGetAdminQuestion({
    request: {},
    params: Promise.resolve({ id: "sq1-q001" }),
    authFn: async () => ({ ok: true, userEmail: "admin@example.com" }),
    db: makeDb({
      storedDoc: makeQuestionDoc("sq1-q001", {
        type: "mcq",
        text: "Question text"
      })
    })
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  assert.equal(result.body.question.id, "sq1-q001");
  assert.equal(result.body.question.text, "Question text");
});

test("executeGetAdminQuestion returns 404 when question is missing", async () => {
  const result = await executeGetAdminQuestion({
    request: {},
    params: Promise.resolve({ id: "missing" }),
    authFn: async () => ({ ok: true, userEmail: "admin@example.com" }),
    db: makeDb()
  });

  assert.equal(result.status, 404);
  assert.deepEqual(result.body, { ok: false, error: "Question not found." });
});

test("executeUpdateAdminQuestion persists normalized patch with admin metadata", async () => {
  let capturedPayload = null;
  let capturedOptions = null;

  const result = await executeUpdateAdminQuestion({
    request: {
      async json() {
        return {
          text: "  Updated text ",
          model_answer: "  Updated explanation ",
          tags: "Seamanship, Seamanship",
          choices: [
            { id: "A", label: "א", text: "first" },
            { id: "B", label: "ב", text: "second" }
          ],
          correct_choice_id: "B"
        };
      }
    },
    params: Promise.resolve({ id: "sq1-q001" }),
    authFn: async () => ({ ok: true, userEmail: "admin@example.com" }),
    nowIso: "2026-05-16T10:00:00.000Z",
    db: makeDb({
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
        capturedPayload = payload;
        capturedOptions = options;
      }
    })
  });

  assert.equal(result.status, 200);
  assert.equal(result.body.ok, true);
  assert.equal(result.body.question.text, "Updated text");
  assert.equal(result.body.question.updated_by, "admin@example.com");
  assert.equal(capturedPayload.updated_at, "2026-05-16T10:00:00.000Z");
  assert.equal(capturedPayload.updated_by, "admin@example.com");
  assert.equal(capturedPayload.correct_choice_id, "b");
  assert.deepEqual(capturedPayload.tags, ["seamanship"]);
  assert.deepEqual(capturedOptions, { merge: true });
});
