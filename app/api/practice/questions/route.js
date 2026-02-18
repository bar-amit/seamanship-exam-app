import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";

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
    const countParam = Number(url.searchParams.get("count") || 10);
    const count = Number.isFinite(countParam) ? Math.max(1, Math.min(50, countParam)) : 10;

    const snapshot = await firebaseAdminDb.collection("questions").get();
    const all = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const selected = shuffle(all).slice(0, count);

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
