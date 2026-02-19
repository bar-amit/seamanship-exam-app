import { NextResponse } from "next/server";
import { firebaseAdminDb } from "../../../../src/lib/firebase/admin.js";
import { normalizeCollectionInput } from "../../../../src/lib/collections/schema.js";

function getUserEmail(request) {
  const email = request.cookies.get("user_email")?.value?.trim().toLowerCase();
  return email || null;
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
}

async function loadOwnedCollection(id, userEmail) {
  const ref = firebaseAdminDb.collection("collections").doc(id);
  const snap = await ref.get();
  if (!snap.exists) {
    return { ref, data: null };
  }
  const data = snap.data();
  if (data.owner_email !== userEmail) {
    return { ref, data: null };
  }
  return { ref, data: { id: snap.id, ...data } };
}

export async function PUT(request, { params }) {
  try {
    const userEmail = getUserEmail(request);
    if (!userEmail) {
      return unauthorized();
    }
    const { id } = params;
    const { ref, data } = await loadOwnedCollection(id, userEmail);
    if (!data) {
      return NextResponse.json({ ok: false, error: "Collection not found." }, { status: 404 });
    }

    const body = await request.json();
    const normalized = normalizeCollectionInput(body);
    const updated = {
      ...data,
      name: normalized.name,
      description: normalized.description,
      question_ids: normalized.questionIds,
      updated_at: new Date().toISOString()
    };

    await ref.set(updated, { merge: true });
    return NextResponse.json({ ok: true, collection: updated });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const userEmail = getUserEmail(request);
    if (!userEmail) {
      return unauthorized();
    }
    const { id } = params;
    const { ref, data } = await loadOwnedCollection(id, userEmail);
    if (!data) {
      return NextResponse.json({ ok: false, error: "Collection not found." }, { status: 404 });
    }

    await ref.delete();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
