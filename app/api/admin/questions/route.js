import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { getUserEmailFromRequest } from "../../../../src/lib/auth/session.js";
import { parseAdminAllowlist, isAllowlistedAdmin } from "../../../../src/lib/auth/allowlist.js";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
}

function requireAdminEmail(request) {
  const userEmail = getUserEmailFromRequest(request);
  if (!userEmail) {
    return { ok: false, response: unauthorized() };
  }

  const allowlist = parseAdminAllowlist(process.env.ADMIN_ALLOWLIST);
  if (!isAllowlistedAdmin(userEmail, allowlist)) {
    return { ok: false, response: forbidden() };
  }

  return { ok: true, userEmail };
}

export async function GET(request) {
  try {
    const auth = requireAdminEmail(request);
    if (!auth.ok) {
      return auth.response;
    }

    const url = new URL(request.url);
    const query = String(url.searchParams.get("query") ?? "")
      .trim()
      .toLowerCase();
    const pageParam = Number(url.searchParams.get("page") ?? 1);
    const pageSizeParam = Number(url.searchParams.get("pageSize") ?? 25);
    const page = Number.isFinite(pageParam) ? Math.max(1, Math.round(pageParam)) : 1;
    const pageSize = Number.isFinite(pageSizeParam)
      ? Math.max(1, Math.min(100, Math.round(pageSizeParam)))
      : 25;

    const snapshot = await firebaseAdminDb.collection("questions").get();
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const filtered = query
      ? all.filter((q) => {
          const text = String(q.text ?? "").toLowerCase();
          const id = String(q.id ?? "").toLowerCase();
          return id.includes(query) || text.includes(query);
        })
      : all;

    const sorted = filtered.sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const total = sorted.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const offset = (safePage - 1) * pageSize;

    const questions = sorted.slice(offset, offset + pageSize).map((q) => ({
        id: q.id,
        type: q.type,
        chapter: q.chapter,
        text: q.text,
        text_preview: String(q.text ?? "").trim().slice(0, 180),
        tags: q.tags ?? [],
        updated_at: q.updated_at ?? null,
        updated_by: q.updated_by ?? null
      }));

    return NextResponse.json({
      ok: true,
      page: safePage,
      pageSize,
      total,
      totalPages,
      count: questions.length,
      questions
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
