import { randomUUID } from "node:crypto";
import { normalizeCollectionInput, buildCollectionDoc } from "./schema.js";

export async function loadOwnedCollection(db, id, userEmail) {
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

function unauthorizedResult(auth) {
  return { status: auth.status, body: { ok: false, error: auth.error } };
}

export async function executeListCollections({ request, authFn, db }) {
  const auth = await authFn(request);
  if (!auth.ok) {
    return unauthorizedResult(auth);
  }

  const snapshot = await db
    .collection("collections")
    .where("owner_email", "==", auth.userEmail)
    .get();

  const collections = snapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)));

  return { status: 200, body: { ok: true, collections } };
}

export async function executeCreateCollection({
  request,
  authFn,
  db,
  nowIso,
  createId = () => `col_${randomUUID()}`
}) {
  const auth = await authFn(request);
  if (!auth.ok) {
    return unauthorizedResult(auth);
  }

  const body = await request.json();
  const normalized = normalizeCollectionInput(body);
  const id = createId();
  const doc = buildCollectionDoc({
    id,
    ownerEmail: auth.userEmail,
    name: normalized.name,
    description: normalized.description,
    questionIds: normalized.questionIds,
    nowIso
  });

  await db.collection("collections").doc(id).set(doc);
  return { status: 201, body: { ok: true, collection: doc } };
}

export async function executeUpdateCollection({ request, params, authFn, db, nowIso }) {
  const auth = await authFn(request);
  if (!auth.ok) {
    return unauthorizedResult(auth);
  }

  const { id } = await params;
  const { ref, data } = await loadOwnedCollection(db, id, auth.userEmail);
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

export async function executeDeleteCollection({ request, params, authFn, db }) {
  const auth = await authFn(request);
  if (!auth.ok) {
    return unauthorizedResult(auth);
  }

  const { id } = await params;
  const { ref, data } = await loadOwnedCollection(db, id, auth.userEmail);
  if (!data) {
    return { status: 404, body: { ok: false, error: "Collection not found." } };
  }

  await ref.delete();
  return { status: 200, body: { ok: true } };
}
