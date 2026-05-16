import { uiText } from "../../content/strings.js";

export const AUTH_UI_CHANGED_EVENT = "auth-ui-changed";

export async function createServerSessionFromFirebaseUser(
  user,
  { fetchImpl = globalThis.fetch } = {}
) {
  const idToken = await user.getIdToken();
  const res = await fetchImpl("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken })
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || uiText.auth.errors.sessionCreateFailed);
  }

  return res.json().catch(() => ({ ok: true }));
}

export async function clearServerSession({ fetchImpl = globalThis.fetch } = {}) {
  const res = await fetchImpl("/api/auth/session", { method: "DELETE" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || uiText.auth.errors.sessionSyncFailed);
  }
  return res.json().catch(() => ({ ok: true }));
}

export async function syncServerSessionForFirebaseUser(
  user,
  { fetchImpl = globalThis.fetch } = {}
) {
  if (!user) {
    await clearServerSession({ fetchImpl });
    return { email: "" };
  }

  await createServerSessionFromFirebaseUser(user, { fetchImpl });
  return { email: user.email ?? "" };
}

export function emitAuthUiChanged({ target = globalThis.window } = {}) {
  if (!target) {
    return;
  }
  target.dispatchEvent(new Event(AUTH_UI_CHANGED_EVENT));
}
