import { jsonError, jsonResult } from "../../../../src/lib/api/response.js";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { executeListTagPracticeQuestions } from "../../../../src/features/tag-practice/questions.js";

export async function GET(request) {
  try {
    const result = await executeListTagPracticeQuestions({
      request,
      db: firebaseAdminDb
    });
    return jsonResult(result);
  } catch (error) {
    return jsonError(error, { status: 500, fallback: "Failed to fetch tag questions" });
  }
}
