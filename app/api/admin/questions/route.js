import { jsonResult } from "../../../../src/lib/api/response.js";
import { jsonLoggedError } from "../../../../src/lib/api/logging.js";
import { executeListAdminQuestions } from "../../../../src/features/admin/service.js";

async function resolveAdminRouteDeps(deps = {}) {
  if (deps.authorizeAdminRequestFn && deps.db) {
    return {
      authFn: deps.authorizeAdminRequestFn,
      db: deps.db
    };
  }

  const [{ firebaseAdminDb }, { authorizeAdminRequest }] = await Promise.all([
    import("../../../../src/lib/firebase/admin.js"),
    import("../../../../src/features/auth/server-session.js")
  ]);

  return {
    authFn: deps.authorizeAdminRequestFn ?? authorizeAdminRequest,
    db: deps.db ?? firebaseAdminDb
  };
}

export async function getAdminQuestionsHandler(request, deps = {}) {
  const { authFn, db } = await resolveAdminRouteDeps(deps);

  try {
    const result = await executeListAdminQuestions({
      request,
      authFn,
      db
    });
    return jsonResult(result);
  } catch (error) {
    return jsonLoggedError(error, { route: "/api/admin/questions", method: "GET", status: 500 });
  }
}

export async function GET(request) {
  return getAdminQuestionsHandler(request);
}
