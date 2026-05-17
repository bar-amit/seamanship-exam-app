import test from "node:test";
import assert from "node:assert/strict";
import { buildDialogProps, isDialogDismissKey } from "../src/lib/a11y/dialog.js";

test("buildDialogProps returns modal dialog props with labelledby when provided", () => {
  assert.deepEqual(buildDialogProps({ labelledBy: "modal-title" }), {
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "modal-title"
  });
});

test("buildDialogProps falls back to aria-label for unlabeled image dialogs", () => {
  assert.deepEqual(buildDialogProps({ label: "Expanded image" }), {
    role: "dialog",
    "aria-modal": "true",
    "aria-label": "Expanded image"
  });
});

test("isDialogDismissKey only matches Escape", () => {
  assert.equal(isDialogDismissKey({ key: "Escape" }), true);
  assert.equal(isDialogDismissKey({ key: "Enter" }), false);
  assert.equal(isDialogDismissKey(null), false);
});
