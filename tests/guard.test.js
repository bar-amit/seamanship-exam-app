import test from "node:test";
import assert from "node:assert/strict";
import { isAdminPath, requiresAuth, canAccessPath } from "../src/features/auth/guard.js";

test("requiresAuth returns false for public routes", () => {
  assert.equal(requiresAuth("/"), false);
  assert.equal(requiresAuth("/about"), false);
});

test("requiresAuth returns true for protected routes", () => {
  assert.equal(requiresAuth("/dashboard"), true);
  assert.equal(requiresAuth("/dashboard/stats"), true);
  assert.equal(requiresAuth("/DASHBOARD"), true);
  assert.equal(requiresAuth("/admin"), true);
});

test("isAdminPath identifies admin routes", () => {
  assert.equal(isAdminPath("/admin"), true);
  assert.equal(isAdminPath("/admin/questions"), true);
  assert.equal(isAdminPath("/ADMIN/questions"), true);
  assert.equal(isAdminPath("/dashboard"), false);
});

test("canAccessPath allows public route without auth", () => {
  assert.equal(
    canAccessPath({
      pathname: "/",
      userEmail: null,
      allowlistRaw: "admin@example.com"
    }),
    true
  );
});

test("canAccessPath blocks protected user routes without auth", () => {
  assert.equal(
    canAccessPath({
      pathname: "/dashboard",
      userEmail: null,
      allowlistRaw: "admin@example.com"
    }),
    false
  );
});

test("canAccessPath allows protected user routes with signed-in user", () => {
  assert.equal(
    canAccessPath({
      pathname: "/dashboard",
      userEmail: "user@example.com",
      allowlistRaw: "admin@example.com"
    }),
    true
  );
});

test("canAccessPath blocks admin route for non-allowlisted email", () => {
  assert.equal(
    canAccessPath({
      pathname: "/admin",
      userEmail: "user@example.com",
      allowlistRaw: "admin@example.com"
    }),
    false
  );
});

test("canAccessPath allows admin route for allowlisted email", () => {
  assert.equal(
    canAccessPath({
      pathname: "/admin",
      userEmail: "admin@example.com",
      allowlistRaw: "admin@example.com"
    }),
    true
  );
});
