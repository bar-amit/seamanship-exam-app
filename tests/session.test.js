import test from "node:test";
import assert from "node:assert/strict";
import {
  AUTH_SESSION_COOKIE,
  USER_EMAIL_COOKIE,
  getSessionCookieFromRequest,
  getUserEmailFromRequest
} from "../src/features/auth/session.js";

function makeRequestWithCookies({ userEmail, authSession } = {}) {
  return {
    cookies: {
      get(name) {
        if (name === USER_EMAIL_COOKIE && userEmail !== undefined) {
          return { value: userEmail };
        }
        if (name === AUTH_SESSION_COOKIE && authSession !== undefined) {
          return { value: authSession };
        }
        return undefined;
      }
    }
  };
}

test("returns null when user email cookie is missing", () => {
  const request = makeRequestWithCookies();
  assert.equal(getUserEmailFromRequest(request), null);
});

test("returns null when user email cookie is empty", () => {
  const request = makeRequestWithCookies({ userEmail: "" });
  assert.equal(getUserEmailFromRequest(request), null);
});

test("normalizes cookie value by trimming and lowering case", () => {
  const request = makeRequestWithCookies({ userEmail: "  USER@Example.COM  " });
  assert.equal(getUserEmailFromRequest(request), "user@example.com");
});

test("returns null when session cookie is missing", () => {
  const request = makeRequestWithCookies();
  assert.equal(getSessionCookieFromRequest(request), null);
});

test("returns trimmed session cookie value", () => {
  const request = makeRequestWithCookies({ authSession: "  abc.def.ghi  " });
  assert.equal(getSessionCookieFromRequest(request), "abc.def.ghi");
});
