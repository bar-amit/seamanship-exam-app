import { jsonError, jsonResult } from "../../../../../src/lib/api/response.js";
import { firebaseAdminDb } from "../../../../../src/lib/firebase/admin.js";
import { authorizeAdminRequest } from "../../../../../src/features/auth/server-session.js";
import {
  executeGetAdminQuestion,
  executeUpdateAdminQuestion
} from "../../../../../src/features/admin/service.js";

export async function GET(request, { params }) {
  try {
    const result = await executeGetAdminQuestion({
      request,
      params,
      authFn: authorizeAdminRequest,
      db: firebaseAdminDb
    });
    return jsonResult(result);
  } catch (error) {
    return jsonError(error, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const result = await executeUpdateAdminQuestion({
      request,
      params,
      authFn: authorizeAdminRequest,
      db: firebaseAdminDb,
      nowIso: new Date().toISOString()
    });
    return jsonResult(result);
  } catch (error) {
    return jsonError(error, { status: 400 });
  }
}
