import test from "node:test";
import assert from "node:assert/strict";
import {
  jsonError,
  jsonResult,
  jsonResultWithCookies
} from "../src/lib/api/response.js";

test("jsonResult returns body and status from service result", async () => {
  const response = jsonResult({
    status: 201,
    body: { ok: true, id: "created" }
  });

  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), { ok: true, id: "created" });
});

test("jsonResultWithCookies applies cookie mutations", () => {
  const response = jsonResultWithCookies({
    status: 200,
    body: { ok: true },
    cookies: [
      {
        name: "auth_session",
        value: "session-cookie",
        options: {
          httpOnly: true,
          path: "/",
          sameSite: "lax",
          maxAge: 60
        }
      }
    ]
  });

  assert.equal(response.status, 200);
  assert.match(response.headers.get("set-cookie"), /auth_session=session-cookie/);
  assert.match(response.headers.get("set-cookie"), /HttpOnly/);
});

test("jsonError prefers error message and falls back when missing", async () => {
  const withMessage = jsonError(new Error("Failed"), { status: 500, fallback: "Fallback" });
  assert.equal(withMessage.status, 500);
  assert.deepEqual(await withMessage.json(), { ok: false, error: "Failed" });

  const withFallback = jsonError(null, { status: 400, fallback: "Fallback" });
  assert.equal(withFallback.status, 400);
  assert.deepEqual(await withFallback.json(), { ok: false, error: "Fallback" });
});
