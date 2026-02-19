import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { authorizeAdminRequest } from "../../../../src/lib/auth/server-session.js";

export async function GET(request) {
  try {
    const auth = await authorizeAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
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
