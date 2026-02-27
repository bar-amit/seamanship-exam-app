import { normalizeCollectionInput } from "./schema.js";

async function loadOwnedCollection(db, id, userEmail) {
  const ref = db.collection("collections").doc(id);
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

export async function executePutCollection({ request, params, authFn, db, nowIso }) {
  const auth = await authFn(request);
  if (!auth.ok) {
    return { status: auth.status, body: { ok: false, error: auth.error } };
  }

  const userEmail = auth.userEmail;
  const { id } = await params;
  const { ref, data } = await loadOwnedCollection(db, id, userEmail);
  if (!data) {
    return { status: 404, body: { ok: false, error: "Collection not found." } };
  }

  const body = await request.json();
  const normalized = normalizeCollectionInput(body);
  const updated = {
    ...data,
    name: normalized.name,
    description: normalized.description,
    question_ids: normalized.questionIds,
    updated_at: nowIso
  };

  await ref.set(updated, { merge: true });
  return { status: 200, body: { ok: true, collection: updated } };
}
