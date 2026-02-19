import {
  COLLECTIONS_FIXTURE,
  PRACTICE_QUESTIONS_FIXTURE,
  TAG_PROGRESS_FIXTURE
} from "./fixtures.js";

async function fulfillJson(route, payload, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(payload)
  });
}

export async function mockPracticeApi(page) {
  await page.route("**/api/practice/questions**", async (route) => {
    await fulfillJson(route, { ok: true, questions: PRACTICE_QUESTIONS_FIXTURE });
  });

  await page.route("**/api/practice/tag-questions**", async (route) => {
    await fulfillJson(route, {
      ok: true,
      requested_tags: ["seamanship"],
      total_pool: PRACTICE_QUESTIONS_FIXTURE.length,
      questions: PRACTICE_QUESTIONS_FIXTURE
    });
  });
}

export async function mockAuthSessionSyncNoop(page) {
  await page.route("**/api/auth/session", async (route) => {
    const request = route.request();
    if (request.method() === "POST") {
      await fulfillJson(route, { ok: true, email: "tester@example.com" });
      return;
    }
    if (request.method() === "DELETE") {
      await fulfillJson(route, { ok: true });
      return;
    }
    await fulfillJson(route, { ok: false, error: "Unsupported method" }, 405);
  });
}

export async function mockCollectionsApi(page) {
  let collections = [...COLLECTIONS_FIXTURE];

  await page.route("**/api/collections", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      await fulfillJson(route, { ok: true, collections });
      return;
    }

    if (request.method() === "POST") {
      const body = request.postDataJSON();
      const created = {
        id: "col_created",
        owner_email: "tester@example.com",
        name: body.name,
        description: body.description ?? "",
        question_ids: body.questionIds ?? [],
        updated_at: new Date().toISOString()
      };
      collections = [created, ...collections];
      await fulfillJson(route, { ok: true, collection: created }, 201);
      return;
    }

    await fulfillJson(route, { ok: false, error: "Unsupported method" }, 405);
  });

  await page.route("**/api/collections/*", async (route) => {
    const request = route.request();
    const id = request.url().split("/").at(-1);
    if (request.method() === "PUT") {
      const body = request.postDataJSON();
      collections = collections.map((col) =>
        col.id === id
          ? {
              ...col,
              name: body.name ?? col.name,
              description: body.description ?? col.description,
              question_ids: body.questionIds ?? col.question_ids,
              updated_at: new Date().toISOString()
            }
          : col
      );
      const updated = collections.find((col) => col.id === id);
      await fulfillJson(route, { ok: true, collection: updated });
      return;
    }

    if (request.method() === "DELETE") {
      collections = collections.filter((col) => col.id !== id);
      await fulfillJson(route, { ok: true });
      return;
    }

    await fulfillJson(route, { ok: false, error: "Unsupported method" }, 405);
  });
}

export async function mockProgressApi(page) {
  await page.route("**/api/progress/tag", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      await fulfillJson(route, { ok: true, progress: TAG_PROGRESS_FIXTURE });
      return;
    }
    if (request.method() === "PUT") {
      await fulfillJson(route, { ok: true, progress: TAG_PROGRESS_FIXTURE });
      return;
    }
    await fulfillJson(route, { ok: false, error: "Unsupported method" }, 405);
  });
}

export async function mockAdminApi(page) {
  const adminQuestion = PRACTICE_QUESTIONS_FIXTURE[0];
  await page.route("**/api/admin/questions?**", async (route) => {
    await fulfillJson(route, {
      ok: true,
      page: 1,
      pageSize: 5,
      total: 1,
      totalPages: 1,
      count: 1,
      questions: [
        {
          id: adminQuestion.id,
          type: adminQuestion.type,
          chapter: adminQuestion.chapter,
          text: adminQuestion.text,
          text_preview: adminQuestion.text,
          tags: adminQuestion.tags,
          updated_at: null,
          updated_by: null
        }
      ]
    });
  });

  await page.route("**/api/admin/questions/*", async (route) => {
    const request = route.request();
    if (request.method() === "GET") {
      await fulfillJson(route, { ok: true, question: adminQuestion });
      return;
    }
    if (request.method() === "PUT") {
      const body = request.postDataJSON();
      await fulfillJson(route, { ok: true, question: { ...adminQuestion, ...body } });
      return;
    }
    await fulfillJson(route, { ok: false, error: "Unsupported method" }, 405);
  });
}
