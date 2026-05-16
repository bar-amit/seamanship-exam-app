import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { authenticateRequest } from "../../../../src/features/auth/server-session.js";
import {
  normalizeTagProgressSnapshot,
  buildTagProgressDoc
} from "../../../../src/lib/progress/tag-progress.js";

export async function GET(request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }
    const userEmail = auth.userEmail;

    const ref = firebaseAdminDb.collection("tag_progress").doc(userEmail);
    const snap = await ref.get();
    if (!snap.exists) {
      return NextResponse.json({ ok: true, progress: null });
    }

    const data = snap.data();
    if (data.owner_email !== userEmail) {
      return NextResponse.json({ ok: true, progress: null });
    }
    return NextResponse.json({ ok: true, progress: data });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth.ok) {
      return NextResponse.json({ ok: false, error: auth.error }, { status: auth.status });
    }
    const userEmail = auth.userEmail;

    const body = await request.json();
    const snapshot = normalizeTagProgressSnapshot(body);
    const nowIso = new Date().toISOString();
    const doc = buildTagProgressDoc({ ownerEmail: userEmail, snapshot, nowIso });

    await firebaseAdminDb.collection("tag_progress").doc(userEmail).set(doc, { merge: true });
    return NextResponse.json({ ok: true, progress: doc });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
