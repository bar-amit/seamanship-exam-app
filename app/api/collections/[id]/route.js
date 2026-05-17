import { jsonResult } from "../../../../src/lib/api/response.js";
import { jsonLoggedError } from "../../../../src/lib/api/logging.js";
import {
  executeDeleteCollection,
  executeUpdateCollection
} from "../../../../src/features/collections/service.js";

async function resolveCollectionRouteDeps(deps = {}) {
  if (deps.authenticateRequestFn && deps.db) {
    return {
      authFn: deps.authenticateRequestFn,
      db: deps.db
    };
  }

  const [{ firebaseAdminDb }, { authenticateRequest }] = await Promise.all([
    import("../../../../src/lib/firebase/admin.js"),
    import("../../../../src/features/auth/server-session.js")
  ]);

  return {
    authFn: deps.authenticateRequestFn ?? authenticateRequest,
    db: deps.db ?? firebaseAdminDb
  };
}

export async function putCollectionHandler(request, { params }, deps = {}) {
  const { authFn, db } = await resolveCollectionRouteDeps(deps);
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
    return jsonLoggedError(error, { route: "/api/collections/[id]", method: "PUT", status: 400 });
  }
}

export async function PUT(request, ctx) {
  return putCollectionHandler(request, ctx);
}

export async function deleteCollectionHandler(request, { params }, deps = {}) {
  const { authFn, db } = await resolveCollectionRouteDeps(deps);

  try {
    const result = await executeDeleteCollection({
      request,
      params,
      authFn,
      db
    });
    return jsonResult(result);
  } catch (error) {
    return jsonLoggedError(error, { route: "/api/collections/[id]", method: "DELETE", status: 400 });
  }
}

export async function DELETE(request, ctx) {
  return deleteCollectionHandler(request, ctx);
}
