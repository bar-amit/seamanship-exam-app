import test from "node:test";
import assert from "node:assert/strict";
import { getUserEmailFromRequest, USER_EMAIL_COOKIE } from "../src/lib/auth/session.js";

function makeRequestWithCookie(cookieValue) {
  return {
    cookies: {
      get(name) {
        if (name !== USER_EMAIL_COOKIE) {
          return undefined;
        }
        if (cookieValue === undefined) {
          return undefined;
        }
        return { value: cookieValue };
      }
    }
  };
}

test("returns null when user email cookie is missing", () => {
  const request = makeRequestWithCookie(undefined);
  assert.equal(getUserEmailFromRequest(request), null);
});

test("returns null when user email cookie is empty", () => {
  const request = makeRequestWithCookie("");
  assert.equal(getUserEmailFromRequest(request), null);
});

test("normalizes cookie value by trimming and lowering case", () => {
  const request = makeRequestWithCookie("  USER@Example.COM  ");
  assert.equal(getUserEmailFromRequest(request), "user@example.com");
});
