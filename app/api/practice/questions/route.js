import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { executeListPracticeQuestions } from "../../../../src/features/practice-test/questions.js";

export async function GET(request) {
  try {
    const result = await executeListPracticeQuestions({
      request,
      db: firebaseAdminDb
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to fetch questions"
      },
      { status: 500 }
    );
  }
}
