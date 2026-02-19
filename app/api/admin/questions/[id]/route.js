import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../../src/lib/firebase/admin.js";
import { authorizeAdminRequest } from "../../../../../src/lib/auth/server-session.js";
import { normalizeAdminQuestionUpdate } from "../../../../../src/lib/admin/question-edit.js";

async function loadQuestionDoc(id) {
  const ref = firebaseAdminDb.collection("questions").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return { ref, data: null };
  }
  return { ref, data: { id: snap.id, ...snap.data() } };
}

export async function GET(request, { params }) {
  try {
    const auth = await authorizeAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const loaded = await loadQuestionDoc(id);
    if (!loaded.data) {
      return NextResponse.json({ ok: false, error: "Question not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, question: loaded.data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await authorizeAdminRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }

    const { id } = await params;
    const loaded = await loadQuestionDoc(id);
    if (!loaded.data) {
      return NextResponse.json({ ok: false, error: "Question not found." }, { status: 404 });
    }

    const body = await request.json();
    const normalizedUpdate = normalizeAdminQuestionUpdate(body, loaded.data);
    const patch = {
      ...normalizedUpdate,
      updated_at: new Date().toISOString(),
      updated_by: auth.userEmail
    };

    await loaded.ref.set(patch, { merge: true });
    return NextResponse.json({
      ok: true,
      question: {
        ...loaded.data,
        ...patch
      }
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
