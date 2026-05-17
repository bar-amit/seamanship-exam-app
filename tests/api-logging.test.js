import test from "node:test";
import assert from "node:assert/strict";
import {
  buildApiErrorLog,
  jsonLoggedError,
  logApiError
} from "../src/lib/api/logging.js";

test("buildApiErrorLog returns a structured payload without request details", () => {
  const entry = buildApiErrorLog({
    route: "/api/collections",
    method: "POST",
    status: 400,
    error: new TypeError("Invalid payload")
  });

  assert.deepEqual(entry, {
    event: "api.error",
    route: "/api/collections",
    method: "POST",
    status: 400,
    error: {
      name: "TypeError",
      message: "Invalid payload"
    }
  });
});

test("logApiError sends the structured entry to the injected logger", () => {
  const entries = [];
  const entry = logApiError({
    route: "/api/progress/tag",
    method: "GET",
    status: 500,
    error: null,
    fallback: "Failed",
    logger: (payload) => entries.push(payload)
  });

  assert.equal(entries.length, 1);
  assert.deepEqual(entries[0], entry);
  assert.deepEqual(entry.error, {
    name: "Error",
    message: "Failed"
  });
});

test("jsonLoggedError preserves jsonError response behavior", async () => {
  const entries = [];
  const response = jsonLoggedError(new Error("Route failed"), {
    route: "/api/practice/questions",
    method: "GET",
    status: 500,
    fallback: "Fallback",
    logger: (payload) => entries.push(payload)
  });

  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { ok: false, error: "Route failed" });
  assert.equal(entries[0].route, "/api/practice/questions");
  assert.equal(entries[0].method, "GET");
});
