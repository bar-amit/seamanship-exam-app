import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { filterQuestionsByTags, normalizeSelectedTags } from "../../../../src/features/tag-practice/tags.js";

function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = out[i];
    out[i] = out[j];
    out[j] = temp;
  }
  return out;
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const countParam = Number(url.searchParams.get("count") || 30);
    const count = Number.isFinite(countParam) ? Math.max(1, Math.min(200, countParam)) : 30;
    const tagsParam = (url.searchParams.get("tags") || "").trim();
    const selectedTags = tagsParam ? tagsParam.split(",") : [];
    const normalizedTags = normalizeSelectedTags(selectedTags);

    const snapshot = await firebaseAdminDb.collection("questions").get();
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const filtered = filterQuestionsByTags(all, normalizedTags);
    const selected = shuffle(filtered).slice(0, count);

    return NextResponse.json({
      ok: true,
      requested_tags: normalizedTags,
      total_pool: filtered.length,
      questions: selected
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
