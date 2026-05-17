import { jsonResult } from "../../../src/lib/api/response.js";
import { jsonLoggedError } from "../../../src/lib/api/logging.js";
import {
  executeCreateCollection,
  executeListCollections
} from "../../../src/features/collections/service.js";

async function resolveCollectionRouteDeps(deps = {}) {
  if (deps.authenticateRequestFn && deps.db) {
    return {
      authFn: deps.authenticateRequestFn,
      db: deps.db
    };
  }

  const [{ firebaseAdminDb }, { authenticateRequest }] = await Promise.all([
    import("../../../src/lib/firebase/admin.js"),
    import("../../../src/features/auth/server-session.js")
  ]);

  return {
    authFn: deps.authenticateRequestFn ?? authenticateRequest,
    db: deps.db ?? firebaseAdminDb
  };
}

export async function getCollectionsHandler(request, deps = {}) {
  const { authFn, db } = await resolveCollectionRouteDeps(deps);

  try {
    const result = await executeListCollections({
      request,
      authFn,
      db
    });
    return jsonResult(result);
  } catch (error) {
    return jsonLoggedError(error, { route: "/api/collections", method: "GET", status: 500 });
  }
}

export async function GET(request) {
  return getCollectionsHandler(request);
}

export async function postCollectionHandler(request, deps = {}) {
  const { authFn, db } = await resolveCollectionRouteDeps(deps);
  const nowIso = deps.nowIso ?? new Date().toISOString();

  try {
    const result = await executeCreateCollection({
      request,
      authFn,
      db,
      nowIso
    });
    return jsonResult(result);
  } catch (error) {
    return jsonLoggedError(error, { route: "/api/collections", method: "POST", status: 400 });
  }
}

export async function POST(request) {
  return postCollectionHandler(request);
}
