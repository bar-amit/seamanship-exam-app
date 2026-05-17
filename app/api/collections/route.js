import { jsonError, jsonResult } from "../../../src/lib/api/response.js";
import { firebaseAdminDb } from "../../../src/lib/firebase/admin.js";
import { authenticateRequest } from "../../../src/features/auth/server-session.js";
import {
  executeCreateCollection,
  executeListCollections
} from "../../../src/features/collections/service.js";

export async function GET(request) {
  try {
    const result = await executeListCollections({
      request,
      authFn: authenticateRequest,
      db: firebaseAdminDb
    });
    return jsonResult(result);
  } catch (error) {
    return jsonError(error, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const result = await executeCreateCollection({
      request,
      authFn: authenticateRequest,
      db: firebaseAdminDb,
      nowIso: new Date().toISOString()
    });
    return jsonResult(result);
  } catch (error) {
    return jsonError(error, { status: 400 });
  }
}
