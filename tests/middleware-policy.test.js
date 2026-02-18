import test from "node:test";
import assert from "node:assert/strict";
import { evaluateAccess } from "../src/lib/auth/middleware-policy.js";

test("public paths return next action", () => {
  const decision = evaluateAccess({
    pathname: "/",
    userEmail: null,
    allowlistRaw: "admin@example.com"
  });

  assert.deepEqual(decision, { action: "next" });
});

test("protected user path redirects when unauthenticated", () => {
  const decision = evaluateAccess({
    pathname: "/dashboard",
    userEmail: null,
    allowlistRaw: "admin@example.com"
  });

  assert.deepEqual(decision, { action: "redirect", destination: "/" });
});

test("protected user path allows signed-in user", () => {
  const decision = evaluateAccess({
    pathname: "/dashboard",
    userEmail: "user@example.com",
    allowlistRaw: "admin@example.com"
  });

  assert.deepEqual(decision, { action: "next" });
});

test("admin path redirects signed-in user not in allowlist", () => {
  const decision = evaluateAccess({
    pathname: "/admin",
    userEmail: "user@example.com",
    allowlistRaw: "admin@example.com"
  });

  assert.deepEqual(decision, { action: "redirect", destination: "/" });
});

test("admin path allows allowlisted user", () => {
  const decision = evaluateAccess({
    pathname: "/admin",
    userEmail: "admin@example.com",
    allowlistRaw: "admin@example.com"
  });

  assert.deepEqual(decision, { action: "next" });
});
