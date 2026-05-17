import test from "node:test";
import assert from "node:assert/strict";
import {
  buildClearAuthSessionResult,
  buildCreateAuthSessionResult,
  sessionCookieOptions,
  userEmailCookieOptions
} from "../src/features/auth/session-route.js";
import { AUTH_SESSION_COOKIE, USER_EMAIL_COOKIE } from "../src/features/auth/session.js";

function makeJsonRequest(body) {
  return {
    async json() {
      return body;
    }
  };
}

test("auth session cookie options preserve security defaults", () => {
  assert.deepEqual(sessionCookieOptions({ nodeEnv: "production" }), {
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true
  });
  assert.equal(userEmailCookieOptions({ nodeEnv: "development" }).httpOnly, false);
});

test("buildCreateAuthSessionResult rejects missing id token", async () => {
  const result = await buildCreateAuthSessionResult({
    request: makeJsonRequest({ idToken: "   " }),
    auth: {}
  });

  assert.deepEqual(result, {
    status: 400,
    body: { ok: false, error: "Missing id token." },
    cookies: []
  });
});

test("buildCreateAuthSessionResult verifies token and returns session cookies", async () => {
  const calls = [];
  const result = await buildCreateAuthSessionResult({
    request: makeJsonRequest({ idToken: " id-token " }),
    nodeEnv: "production",
    auth: {
      async verifyIdToken(token, checkRevoked) {
        calls.push(["verify", token, checkRevoked]);
        return { email: " USER@Example.COM " };
      },
      async createSessionCookie(token, options) {
        calls.push(["session", token, options]);
        return "session-cookie";
      }
    }
  });

  assert.deepEqual(calls, [
    ["verify", "id-token", true],
    ["session", "id-token", { expiresIn: 60 * 60 * 24 * 7 * 1000 }]
  ]);
  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true, email: "user@example.com" });
  assert.deepEqual(
    result.cookies.map((cookie) => [cookie.name, cookie.value, cookie.options.httpOnly]),
    [
      [AUTH_SESSION_COOKIE, "session-cookie", true],
      [USER_EMAIL_COOKIE, "user@example.com", false]
    ]
  );
  assert.equal(result.cookies[0].options.secure, true);
});

test("buildCreateAuthSessionResult rejects verified token without email", async () => {
  const result = await buildCreateAuthSessionResult({
    request: makeJsonRequest({ idToken: "id-token" }),
    auth: {
      async verifyIdToken() {
        return { email: "" };
      }
    }
  });

  assert.deepEqual(result, {
    status: 400,
    body: { ok: false, error: "Email is required." },
    cookies: []
  });
});

test("buildClearAuthSessionResult expires auth cookies", () => {
  const result = buildClearAuthSessionResult({ nodeEnv: "development" });

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { ok: true });
  assert.deepEqual(
    result.cookies.map((cookie) => [cookie.name, cookie.value, cookie.options.maxAge]),
    [
      [AUTH_SESSION_COOKIE, "", 0],
      [USER_EMAIL_COOKIE, "", 0]
    ]
  );
});
