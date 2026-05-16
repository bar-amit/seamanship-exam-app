import { parseAdminAllowlist, isAllowlistedAdmin } from "./allowlist.js";
import { getSessionCookieFromRequest } from "./session.js";

function normalizeEmail(value) {
  const email = String(value ?? "").trim().toLowerCase();
  return email || null;
}

export function createSessionResolver({ verifySessionCookie }) {
  return async function resolveUserFromSession(request) {
    const sessionCookie = getSessionCookieFromRequest(request);
    if (!sessionCookie) {
      return { ok: false, status: 401, error: "Authentication required." };
    }

    try {
      const decoded = await verifySessionCookie(sessionCookie, true);
      const userEmail = normalizeEmail(decoded?.email);
      if (!userEmail) {
        return { ok: false, status: 401, error: "Authenticated email is missing." };
      }
      return { ok: true, userEmail };
    } catch (error) {
      return { ok: false, status: 401, error: error.message || "Invalid session." };
    }
  };
}

async function defaultVerifySessionCookie(sessionCookie, checkRevoked) {
  const { firebaseAdminAuth } = await import("../../lib/firebase/admin.js");
  return firebaseAdminAuth.verifySessionCookie(sessionCookie, checkRevoked);
}

const defaultResolveUserFromSession = createSessionResolver({
  verifySessionCookie: defaultVerifySessionCookie
});

export async function authenticateRequest(
  request,
  { resolveUserFromSession = defaultResolveUserFromSession } = {}
) {
  return resolveUserFromSession(request);
}

export async function authorizeAdminRequest(
  request,
  {
    resolveUserFromSession = defaultResolveUserFromSession,
    allowlistRaw = process.env.ADMIN_ALLOWLIST
  } = {}
) {
  const auth = await resolveUserFromSession(request);
  if (!auth.ok) {
    return auth;
  }

  const allowlist = parseAdminAllowlist(allowlistRaw);
  if (!isAllowlistedAdmin(auth.userEmail, allowlist)) {
    return { ok: false, status: 403, error: "Admin access required." };
  }

  return auth;
}
