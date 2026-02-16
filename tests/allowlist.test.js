import test from "node:test";
import assert from "node:assert/strict";
import { parseAdminAllowlist, isAllowlistedAdmin } from "../src/lib/auth/allowlist.js";

test("parseAdminAllowlist normalizes commas, spaces and case", () => {
  const list = parseAdminAllowlist(" A@EXAMPLE.COM, b@example.com ,, c@example.com ");
  assert.equal(list.size, 3);
  assert.equal(list.has("a@example.com"), true);
  assert.equal(list.has("b@example.com"), true);
  assert.equal(list.has("c@example.com"), true);
});

test("isAllowlistedAdmin matches case-insensitively", () => {
  const list = parseAdminAllowlist("admin@example.com");
  assert.equal(isAllowlistedAdmin("ADMIN@example.com", list), true);
  assert.equal(isAllowlistedAdmin("user@example.com", list), false);
  assert.equal(isAllowlistedAdmin("", list), false);
});
