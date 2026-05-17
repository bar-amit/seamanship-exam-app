import { jsonError, jsonResult } from "../../../../src/lib/api/response.js";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { executeListPracticeQuestions } from "../../../../src/features/practice-test/questions.js";

export async function GET(request) {
  try {
    const result = await executeListPracticeQuestions({
      request,
      db: firebaseAdminDb
    });
    return jsonResult(result);
  } catch (error) {
    return jsonError(error, { status: 500, fallback: "Failed to fetch questions" });
  }
}
