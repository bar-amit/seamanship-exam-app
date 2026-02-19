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
    const limitParam = Number(url.searchParams.get("limit") ?? 200);
    const limit = Number.isFinite(limitParam) ? Math.max(1, Math.min(500, Math.round(limitParam))) : 200;

    const snapshot = await firebaseAdminDb.collection("questions").get();
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const filtered = query
      ? all.filter((q) => {
          const text = String(q.text ?? "").toLowerCase();
          const id = String(q.id ?? "").toLowerCase();
          return id.includes(query) || text.includes(query);
        })
      : all;

    const questions = filtered
      .slice(0, limit)
      .map((q) => ({
        id: q.id,
        type: q.type,
        chapter: q.chapter,
        text: q.text,
        tags: q.tags ?? [],
        updated_at: q.updated_at ?? null,
        updated_by: q.updated_by ?? null
      }))
      .sort((a, b) => String(a.id).localeCompare(String(b.id)));

    return NextResponse.json({ ok: true, count: questions.length, questions });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}
