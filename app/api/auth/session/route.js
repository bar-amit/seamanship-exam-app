import { jsonResultWithCookies } from "../../../../src/lib/api/response.js";
import { jsonLoggedError } from "../../../../src/lib/api/logging.js";
import { firebaseAdminAuth } from "../../../../src/lib/firebase/admin.js";
import {
  buildClearAuthSessionResult,
  buildCreateAuthSessionResult
} from "../../../../src/features/auth/session-route.js";

export async function POST(request) {
  try {
    const result = await buildCreateAuthSessionResult({
      request,
      auth: firebaseAdminAuth,
      nodeEnv: process.env.NODE_ENV
    });
    return jsonResultWithCookies(result);
  } catch (error) {
    return jsonLoggedError(error, { route: "/api/auth/session", method: "POST", status: 401 });
  }
}

export async function DELETE() {
  return jsonResultWithCookies(buildClearAuthSessionResult({ nodeEnv: process.env.NODE_ENV }));
}
