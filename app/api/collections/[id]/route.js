import { jsonError, jsonResult } from "../../../../src/lib/api/response.js";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { authenticateRequest } from "../../../../src/features/auth/server-session.js";
import {
  executeDeleteCollection,
  executeUpdateCollection
} from "../../../../src/features/collections/service.js";

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
    return jsonResult(result);
  } catch (error) {
    return jsonError(error, { status: 400 });
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
    return jsonResult(result);
  } catch (error) {
    return jsonError(error, { status: 400 });
  }
}
