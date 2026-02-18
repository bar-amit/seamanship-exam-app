import test from "node:test";
import assert from "node:assert/strict";
import {
  buildSq3AssetByQuestionNumber,
  buildLegacyImageDescriptionByFile
} from "../src/lib/import/sq3-assets.js";

test("buildSq3AssetByQuestionNumber normalizes extension", () => {
  const rows = [
    { question_number: 1, asset: "image_36" },
    { question_number: 2, asset: "image_37.jpg" },
    { question_number: 3, asset: "" }
  ];
  const map = buildSq3AssetByQuestionNumber(rows);
  assert.equal(map["1"], "image_36.jpg");
  assert.equal(map["2"], "image_37.jpg");
  assert.equal(map["3"], undefined);
});

test("buildLegacyImageDescriptionByFile maps description by file name", () => {
  const rows = [{ file_name: "image_36.jpg", description: "foo" }];
  const map = buildLegacyImageDescriptionByFile(rows);
  assert.equal(map["image_36.jpg"], "foo");
});
