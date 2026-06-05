import test from "node:test";
import assert from "node:assert/strict";
import {
  appendChoiceRow,
  appendSubAnswerRow,
  appendSubQuestionRow,
  choicesToDraft,
  imageRefsToDraft,
  parseTags,
  removeDraftRow,
  subAnswersToDraft,
  subQuestionsToDraft,
  updateDraftRowField,
  updateSubAnswerTextAtIndex
} from "../src/features/admin/question-draft.js";

test("question draft helpers convert persisted question fields to editable rows", () => {
  assert.deepEqual(
    choicesToDraft([{ label: "א", text: "first" }]),
    [{ id: "a", label: "א", text: "first", image_ref: "" }]
  );
  assert.deepEqual(
    subQuestionsToDraft([{ label: "א", text: "part", order: 3 }]),
    [{ id: "a", label: "א", text: "part", order: 3 }]
  );
  assert.deepEqual(
    subAnswersToDraft([{ text: "answer" }], [{ id: "b", label: "ב", order: 2 }]),
    [{ id: "b", label: "ב", text: "answer", order: 2 }]
  );
  assert.equal(parseTags(["navigation", "safety"]), "navigation, safety");
  assert.equal(imageRefsToDraft({ image_refs: ["one.png", "two.png"], image_ref: "legacy.png" }), "one.png\ntwo.png");
});

test("question draft row helpers add, update and remove editor rows", () => {
  assert.deepEqual(appendChoiceRow([]), [{ id: "", label: "", text: "", image_ref: "" }]);
  assert.deepEqual(appendSubQuestionRow([]), [{ id: "", label: "", text: "", order: 1 }]);
  assert.deepEqual(appendSubAnswerRow([]), [{ id: "", label: "", text: "", order: 1 }]);

  const rows = [
    { id: "a", text: "first" },
    { id: "b", text: "second" }
  ];
  assert.deepEqual(updateDraftRowField(rows, 1, "text", "updated"), [
    { id: "a", text: "first" },
    { id: "b", text: "updated" }
  ]);
  assert.deepEqual(removeDraftRow(rows, 0), [{ id: "b", text: "second" }]);
  assert.deepEqual(updateSubAnswerTextAtIndex([], 1, "late answer"), [
    { id: "", label: "", text: "", order: 1 },
    { id: "", label: "", text: "late answer", order: 2 }
  ]);
});
