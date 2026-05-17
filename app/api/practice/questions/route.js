import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import {
  normalizePracticeQuestionLimit,
  selectPracticeQuestions
} from "../../../../src/features/practice-test/questions.js";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const count = normalizePracticeQuestionLimit(url.searchParams.get("count"));

    const snapshot = await firebaseAdminDb.collection("questions").get();
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const selected = selectPracticeQuestions(all, { count });

    return NextResponse.json({
      ok: true,
      questions: selected
    });
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
