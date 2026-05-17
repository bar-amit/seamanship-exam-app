import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import {
  normalizeTagQuestionRequest,
  selectTagPracticeQuestions
} from "../../../../src/features/tag-practice/questions.js";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const { count, selectedTags } = normalizeTagQuestionRequest({
      countParam: url.searchParams.get("count"),
      tagsParam: url.searchParams.get("tags")
    });

    const snapshot = await firebaseAdminDb.collection("questions").get();
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const selection = selectTagPracticeQuestions(all, { count, selectedTags });

    return NextResponse.json({
      ok: true,
      requested_tags: selection.requestedTags,
      total_pool: selection.totalPool,
      questions: selection.questions
    });
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
