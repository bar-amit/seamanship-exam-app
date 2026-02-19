import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { firebaseAdminDb } from "../../../src/lib/firebase/admin.js";
import { normalizeCollectionInput, buildCollectionDoc } from "../../../src/lib/collections/schema.js";

function getUserEmail(request) {
  const email = request.cookies.get("user_email")?.value?.trim().toLowerCase();
  return email || null;
}

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Authentication required." }, { status: 401 });
}

export async function GET(request) {
  try {
    const userEmail = getUserEmail(request);
    if (!userEmail) {
      return unauthorized();
    }

    const snapshot = await firebaseAdminDb
      .collection("collections")
      .where("owner_email", "==", userEmail)
      .get();

    const collections = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));

    return NextResponse.json({ ok: true, collections });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const userEmail = getUserEmail(request);
    if (!userEmail) {
      return unauthorized();
    }

    const body = await request.json();
    const normalized = normalizeCollectionInput(body);
    const id = `col_${randomUUID()}`;
    const nowIso = new Date().toISOString();
    const doc = buildCollectionDoc({
      id,
      ownerEmail: userEmail,
      name: normalized.name,
      description: normalized.description,
      questionIds: normalized.questionIds,
      nowIso
    });

    await firebaseAdminDb.collection("collections").doc(id).set(doc);
    return NextResponse.json({ ok: true, collection: doc }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 });
  }
}
