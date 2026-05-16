import { normalizeAdminQuestionUpdate } from "./question-edit.js";

function unauthorizedResult(auth) {
  return { status: auth.status, body: { ok: false, error: auth.error } };
}

function parseQuestionListParams(url) {
  const parsedUrl = new URL(url);
  const query = String(parsedUrl.searchParams.get("query") ?? "")
    .trim()
    .toLowerCase();
  const pageParam = Number(parsedUrl.searchParams.get("page") ?? 1);
  const pageSizeParam = Number(parsedUrl.searchParams.get("pageSize") ?? 25);

  const page = Number.isFinite(pageParam) ? Math.max(1, Math.round(pageParam)) : 1;
  const pageSize = Number.isFinite(pageSizeParam)
    ? Math.max(1, Math.min(100, Math.round(pageSizeParam)))
    : 25;

  return { query, page, pageSize };
}

function toQuestionPreview(question) {
  return {
    id: question.id,
    type: question.type,
    chapter: question.chapter,
    text: question.text,
    text_preview: String(question.text ?? "").trim().slice(0, 180),
    tags: question.tags ?? [],
    updated_at: question.updated_at ?? null,
    updated_by: question.updated_by ?? null
  };
}

export async function loadQuestionDoc(db, id) {
  const ref = db.collection("questions").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return { ref, data: null };
  }
  return { ref, data: { id: snap.id, ...snap.data() } };
}

export async function executeListAdminQuestions({ request, authFn, db }) {
  const auth = await authFn(request);
  if (!auth.ok) {
    return unauthorizedResult(auth);
  }

  const { query, page, pageSize } = parseQuestionListParams(request.url);
  const snapshot = await db.collection("questions").get();
  const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  const filtered = query
    ? all.filter((question) => {
        const text = String(question.text ?? "").toLowerCase();
        const id = String(question.id ?? "").toLowerCase();
        return id.includes(query) || text.includes(query);
      })
    : all;

  const sorted = filtered.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * pageSize;
  const questions = sorted.slice(offset, offset + pageSize).map(toQuestionPreview);

  return {
    status: 200,
    body: {
      ok: true,
      page: safePage,
      pageSize,
      total,
      totalPages,
      count: questions.length,
      questions
    }
  };
}

export async function executeGetAdminQuestion({ request, params, authFn, db }) {
  const auth = await authFn(request);
  if (!auth.ok) {
    return unauthorizedResult(auth);
  }

  const { id } = await params;
  const loaded = await loadQuestionDoc(db, id);
  if (!loaded.data) {
    return { status: 404, body: { ok: false, error: "Question not found." } };
  }

  return { status: 200, body: { ok: true, question: loaded.data } };
}

export async function executeUpdateAdminQuestion({ request, params, authFn, db, nowIso }) {
  const auth = await authFn(request);
  if (!auth.ok) {
    return unauthorizedResult(auth);
  }

  const { id } = await params;
  const loaded = await loadQuestionDoc(db, id);
  if (!loaded.data) {
    return { status: 404, body: { ok: false, error: "Question not found." } };
  }

  const body = await request.json();
  const normalizedUpdate = normalizeAdminQuestionUpdate(body, loaded.data);
  const patch = {
    ...normalizedUpdate,
    updated_at: nowIso,
    updated_by: auth.userEmail
  };

  await loaded.ref.set(patch, { merge: true });
  return {
    status: 200,
    body: {
      ok: true,
      question: {
        ...loaded.data,
        ...patch
      }
    }
  };
}
