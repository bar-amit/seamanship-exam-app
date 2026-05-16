import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { authenticateRequest } from "../../../../src/lib/auth/server-session.js";
import {
  executeDeleteCollection,
  executeUpdateCollection
} from "../../../../src/lib/collections/service.js";

export async function putCollectionHandler(request, { params }, deps = {}) {
  const authFn = deps.authenticateRequestFn ?? authenticateRequest;
  const db = deps.db ?? firebaseAdminDb;
  const nowIso = deps.nowIso ?? new Date().toISOString();

  try {
    const result = await executeUpdateCollection({
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
    const result = await executeDeleteCollection({
      request,
      params,
      authFn: authenticateRequest,
      db: firebaseAdminDb
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
