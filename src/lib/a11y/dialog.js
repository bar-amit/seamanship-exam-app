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
