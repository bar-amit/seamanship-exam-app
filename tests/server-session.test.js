import test from "node:test";
import assert from "node:assert/strict";
import {
  authenticateRequest,
  authorizeAdminRequest,
  createSessionResolver
} from "../src/lib/auth/server-session.js";
import { AUTH_SESSION_COOKIE } from "../src/lib/auth/session.js";

function makeRequest(sessionCookieValue) {
  return {
    cookies: {
      get(name) {
        if (name !== AUTH_SESSION_COOKIE) {
          return undefined;
        }
        if (sessionCookieValue === undefined) {
          return undefined;
        }
        return { value: sessionCookieValue };
      }
    }
  };
}

test("authenticateRequest returns 401 when session cookie missing", async () => {
  const resolveUserFromSession = createSessionResolver({
    verifySessionCookie: async () => ({ email: "user@example.com" })
  });
  const out = await authenticateRequest(makeRequest(undefined), { resolveUserFromSession });
  assert.equal(out.ok, false);
  assert.equal(out.status, 401);
});

test("authenticateRequest returns normalized email when verification succeeds", async () => {
  const resolveUserFromSession = createSessionResolver({
    verifySessionCookie: async (cookieValue) => {
      assert.equal(cookieValue, "session-token");
      return { email: "  USER@Example.com " };
    }
  });
  const out = await authenticateRequest(makeRequest("session-token"), { resolveUserFromSession });
  assert.equal(out.ok, true);
  assert.equal(out.userEmail, "user@example.com");
});

test("authenticateRequest returns 401 when verifier throws", async () => {
  const resolveUserFromSession = createSessionResolver({
    verifySessionCookie: async () => {
      throw new Error("invalid");
    }
  });
  const out = await authenticateRequest(makeRequest("bad"), { resolveUserFromSession });
  assert.equal(out.ok, false);
  assert.equal(out.status, 401);
});

test("authorizeAdminRequest returns 403 for non-allowlisted user", async () => {
  const resolveUserFromSession = createSessionResolver({
    verifySessionCookie: async () => ({ email: "user@example.com" })
  });
  const out = await authorizeAdminRequest(makeRequest("ok"), {
    resolveUserFromSession,
    allowlistRaw: "admin@example.com"
  });
  assert.equal(out.ok, false);
  assert.equal(out.status, 403);
});

test("authorizeAdminRequest allows allowlisted admin user", async () => {
  const resolveUserFromSession = createSessionResolver({
    verifySessionCookie: async () => ({ email: "admin@example.com" })
  });
  const out = await authorizeAdminRequest(makeRequest("ok"), {
    resolveUserFromSession,
    allowlistRaw: "admin@example.com"
  });
  assert.equal(out.ok, true);
  assert.equal(out.userEmail, "admin@example.com");
});
