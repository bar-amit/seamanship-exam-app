import { jsonResult } from "../../../../../src/lib/api/response.js";
import { jsonLoggedError } from "../../../../../src/lib/api/logging.js";
import {
  executeGetAdminQuestion,
  executeUpdateAdminQuestion
} from "../../../../../src/features/admin/service.js";

async function resolveAdminRouteDeps(deps = {}) {
  if (deps.authorizeAdminRequestFn && deps.db) {
    return {
      authFn: deps.authorizeAdminRequestFn,
      db: deps.db
    };
  }

  const [{ firebaseAdminDb }, { authorizeAdminRequest }] = await Promise.all([
    import("../../../../../src/lib/firebase/admin.js"),
    import("../../../../../src/features/auth/server-session.js")
  ]);

  return {
    authFn: deps.authorizeAdminRequestFn ?? authorizeAdminRequest,
    db: deps.db ?? firebaseAdminDb
  };
}

export async function getAdminQuestionHandler(request, { params }, deps = {}) {
  const { authFn, db } = await resolveAdminRouteDeps(deps);

  try {
    const result = await executeGetAdminQuestion({
      request,
      params,
      authFn,
      db
    });
    return jsonResult(result);
  } catch (error) {
    return jsonLoggedError(error, { route: "/api/admin/questions/[id]", method: "GET", status: 500 });
  }
}

export async function GET(request, ctx) {
  return getAdminQuestionHandler(request, ctx);
}

export async function putAdminQuestionHandler(request, { params }, deps = {}) {
  const { authFn, db } = await resolveAdminRouteDeps(deps);
  const nowIso = deps.nowIso ?? new Date().toISOString();

  try {
    const result = await executeUpdateAdminQuestion({
      request,
      params,
      authFn,
      db,
      nowIso
    });
    return jsonResult(result);
  } catch (error) {
    return jsonLoggedError(error, { route: "/api/admin/questions/[id]", method: "PUT", status: 400 });
  }
}

export async function PUT(request, ctx) {
  return putAdminQuestionHandler(request, ctx);
}
