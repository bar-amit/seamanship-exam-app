import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { executeListTagPracticeQuestions } from "../../../../src/features/tag-practice/questions.js";

export async function GET(request) {
  try {
    const result = await executeListTagPracticeQuestions({
      request,
      db: firebaseAdminDb
    });
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Failed to fetch tag questions"
      },
      { status: 500 }
    );
  }
}
