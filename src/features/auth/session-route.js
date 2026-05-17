import { AUTH_SESSION_COOKIE, USER_EMAIL_COOKIE } from "./session.js";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_EXPIRES_IN_MS = SESSION_MAX_AGE_SECONDS * 1000;

function baseCookieOptions({ nodeEnv = process.env.NODE_ENV } = {}) {
  return {
    sameSite: "lax",
    secure: nodeEnv === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  };
}

export function sessionCookieOptions(options) {
  return {
    ...baseCookieOptions(options),
    httpOnly: true
  };
}

export function userEmailCookieOptions(options) {
  return {
    ...baseCookieOptions(options),
    httpOnly: false
  };
}

export function buildClearAuthSessionResult(options = {}) {
  return {
    status: 200,
    body: { ok: true },
    cookies: [
      {
        name: AUTH_SESSION_COOKIE,
        value: "",
        options: {
          ...sessionCookieOptions(options),
          maxAge: 0
        }
      },
      {
        name: USER_EMAIL_COOKIE,
        value: "",
        options: {
          ...userEmailCookieOptions(options),
          maxAge: 0
        }
      }
    ]
  };
}

export async function buildCreateAuthSessionResult({ request, auth, nodeEnv } = {}) {
  const body = await request.json();
  const idToken = String(body?.idToken ?? "").trim();
  if (!idToken) {
    return { status: 400, body: { ok: false, error: "Missing id token." }, cookies: [] };
  }

  const decoded = await auth.verifyIdToken(idToken, true);
  const email = String(decoded.email ?? "").trim().toLowerCase();
  if (!email) {
    return { status: 400, body: { ok: false, error: "Email is required." }, cookies: [] };
  }

  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_EXPIRES_IN_MS
  });

  return {
    status: 200,
    body: { ok: true, email },
    cookies: [
      {
        name: AUTH_SESSION_COOKIE,
        value: sessionCookie,
        options: sessionCookieOptions({ nodeEnv })
      },
      {
        name: USER_EMAIL_COOKIE,
        value: email,
        options: userEmailCookieOptions({ nodeEnv })
      }
    ]
  };
}
