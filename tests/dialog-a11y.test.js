import test from "node:test";
import assert from "node:assert/strict";
import {
  buildDialogProps,
  focusInitialDialogElement,
  getFocusableDialogElements,
  isDialogDismissKey,
  restoreDialogFocus,
  trapDialogFocus
} from "../src/lib/a11y/dialog.js";

function makeElement({ disabled = false, hidden = false } = {}) {
  return {
    disabled,
    focused: false,
    offsetParent: hidden ? null : {},
    attributes: {},
    focus() {
      this.focused = true;
    },
    getAttribute(name) {
      return this.attributes[name] ?? null;
    }
  };
}

function makeContainer(elements, activeElement = null) {
  return {
    focused: false,
    ownerDocument: { activeElement },
    querySelectorAll() {
      return elements;
    },
    focus() {
      this.focused = true;
    }
  };
}

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

test("getFocusableDialogElements excludes disabled and hidden elements", () => {
  const enabled = makeElement();
  const disabled = makeElement({ disabled: true });
  const hidden = makeElement({ hidden: true });
  hidden.attributes["aria-hidden"] = "true";

  assert.deepEqual(getFocusableDialogElements(makeContainer([enabled, disabled, hidden])), [enabled]);
});

test("focusInitialDialogElement focuses first focusable element or container fallback", () => {
  const first = makeElement();
  const container = makeContainer([first]);

  assert.equal(focusInitialDialogElement(container), first);
  assert.equal(first.focused, true);

  const emptyContainer = makeContainer([]);
  assert.equal(focusInitialDialogElement(emptyContainer), emptyContainer);
  assert.equal(emptyContainer.focused, true);
});

test("trapDialogFocus wraps Tab inside the dialog", () => {
  const first = makeElement();
  const last = makeElement();
  const container = makeContainer([first, last], last);
  const event = {
    key: "Tab",
    shiftKey: false,
    prevented: false,
    preventDefault() {
      this.prevented = true;
    }
  };

  assert.equal(trapDialogFocus(event, container, last), true);
  assert.equal(event.prevented, true);
  assert.equal(first.focused, true);
});

test("trapDialogFocus wraps Shift+Tab inside the dialog", () => {
  const first = makeElement();
  const last = makeElement();
  const container = makeContainer([first, last], first);
  const event = {
    key: "Tab",
    shiftKey: true,
    prevented: false,
    preventDefault() {
      this.prevented = true;
    }
  };

  assert.equal(trapDialogFocus(event, container, first), true);
  assert.equal(event.prevented, true);
  assert.equal(last.focused, true);
});

test("restoreDialogFocus focuses the previously active element when possible", () => {
  const previous = makeElement();
  restoreDialogFocus(previous);
  assert.equal(previous.focused, true);
  assert.doesNotThrow(() => restoreDialogFocus(null));
});
