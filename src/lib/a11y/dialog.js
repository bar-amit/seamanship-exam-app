const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export function buildDialogProps({ label, labelledBy } = {}) {
  const props = {
    role: "dialog",
    "aria-modal": "true"
  };

  if (labelledBy) {
    props["aria-labelledby"] = labelledBy;
  } else if (label) {
    props["aria-label"] = label;
  }

  return props;
}

export function isDialogDismissKey(event) {
  return event?.key === "Escape";
}

export function isDialogTabKey(event) {
  return event?.key === "Tab";
}

export function getFocusableDialogElements(container) {
  if (!container?.querySelectorAll) {
    return [];
  }

  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.disabled || element.getAttribute?.("aria-hidden") === "true") {
      return false;
    }
    if (element === container.ownerDocument?.activeElement) {
      return true;
    }
    if (element.offsetParent !== null) {
      return true;
    }
    return typeof element.getClientRects === "function" && element.getClientRects().length > 0;
  });
}

export function focusInitialDialogElement(container) {
  if (!container?.focus) {
    return null;
  }

  const [firstFocusable] = getFocusableDialogElements(container);
  const target = firstFocusable ?? container;
  target.focus();
  return target;
}

export function restoreDialogFocus(element) {
  if (element?.focus) {
    element.focus();
  }
}

export function trapDialogFocus(event, container, activeElement = globalThis.document?.activeElement) {
  if (!isDialogTabKey(event)) {
    return false;
  }

  const focusableElements = getFocusableDialogElements(container);
  if (focusableElements.length === 0) {
    event.preventDefault();
    container?.focus?.();
    return true;
  }

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];
  const isBackward = Boolean(event.shiftKey);

  if (isBackward && activeElement === first) {
    event.preventDefault();
    last.focus();
    return true;
  }

  if (!isBackward && activeElement === last) {
    event.preventDefault();
    first.focus();
    return true;
  }

  return false;
}
