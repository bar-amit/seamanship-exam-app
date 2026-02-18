import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("root layout declares Hebrew language and RTL direction", () => {
  const layoutSource = readFileSync("app/layout.js", "utf8");

  assert.match(layoutSource, /<html[^>]*lang="he"/);
  assert.match(layoutSource, /<html[^>]*dir="rtl"/);
});
