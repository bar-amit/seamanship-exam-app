import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { authenticateRequest } from "../../../../src/lib/auth/server-session.js";
import { executePutCollection } from "../../../../src/lib/collections/route-put.js";

export async function putCollectionHandler(request, { params }, deps = {}) {
  const authFn = deps.authenticateRequestFn ?? authenticateRequest;
  const db = deps.db ?? firebaseAdminDb;
  const nowIso = deps.nowIso ?? new Date().toISOString();

  try {
    const result = await executePutCollection({
      request,
      params,
      authFn,
      db,
      nowIso
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request, ctx) {
  return putCollectionHandler(request, ctx);
}

export async function DELETE(request, { params }) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }
    const userEmail = auth.userEmail;
    const { id } = await params;
    const { ref, data } = await loadOwnedCollection(firebaseAdminDb, id, userEmail);
    if (!data) {
      return NextResponse.json({ ok: false, error: "Collection not found." }, { status: 404 });
    }

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
