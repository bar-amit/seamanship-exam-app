import { jsonError, jsonResult } from "../../../../src/lib/api/response.js";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { authorizeAdminRequest } from "../../../../src/features/auth/server-session.js";
import { executeListAdminQuestions } from "../../../../src/features/admin/service.js";

export async function GET(request) {
  try {
    const result = await executeListAdminQuestions({
      request,
      authFn: authorizeAdminRequest,
      db: firebaseAdminDb
    });
    return jsonResult(result);
  } catch (error) {
    return jsonError(error, { status: 500 });
  }
}
