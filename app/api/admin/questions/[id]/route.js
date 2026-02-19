import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../../src/lib/firebase/admin.js";
import { getUserEmailFromRequest } from "../../../../../src/lib/auth/session.js";
import {
  parseAdminAllowlist,
  isAllowlistedAdmin
} from "../../../../../src/lib/auth/allowlist.js";
import { normalizeAdminQuestionUpdate } from "../../../../../src/lib/admin/question-edit.js";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
}

function forbidden() {
  return NextResponse.json({ ok: false, error: "Admin access required." }, { status: 403 });
}

function requireAdminEmail(request) {
  const userEmail = getUserEmailFromRequest(request);
  if (!userEmail) {
    return { ok: false, response: unauthorized() };
  }

  const allowlist = parseAdminAllowlist(process.env.ADMIN_ALLOWLIST);
  if (!isAllowlistedAdmin(userEmail, allowlist)) {
    return { ok: false, response: forbidden() };
  }

  return { ok: true, userEmail };
}

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
    const auth = requireAdminEmail(request);
    if (!auth.ok) {
      return auth.response;
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
    const auth = requireAdminEmail(request);
    if (!auth.ok) {
      return auth.response;
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
