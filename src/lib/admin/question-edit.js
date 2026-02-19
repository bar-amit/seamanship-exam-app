const HEBREW_LABELS = {
  a: "א",
  b: "ב",
  c: "ג",
  d: "ד"
};

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeTagList(value, chapter) {
  let rawTags = [];
  if (Array.isArray(value)) {
    rawTags = value;
  } else {
    rawTags = String(value ?? "")
      .split(",")
      .map((tag) => tag.trim());
  }

  const tags = Array.from(
    new Set(
      rawTags
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (tags.length > 0) {
    return tags;
  }

  if (chapter) {
    return [String(chapter).replace(/_/g, " ").toLowerCase()];
  }

  return ["general"];
}

function normalizeSubQuestionId(value, index) {
  const parsed = normalizeText(value).toLowerCase();
  if (parsed) {
    return parsed;
  }
  return String.fromCharCode("a".charCodeAt(0) + index);
}

function normalizeSubQuestions(subQuestions) {
  const rows = Array.isArray(subQuestions) ? subQuestions : [];
  const out = [];

  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const text = normalizeText(row?.text);
    if (!text) {
      continue;
    }

    const id = normalizeSubQuestionId(row?.id, i);
    const label = normalizeText(row?.label) || HEBREW_LABELS[id] || id.toUpperCase();
    const rawOrder = Number(row?.order);
    const order = Number.isFinite(rawOrder) ? Math.max(1, Math.round(rawOrder)) : i + 1;

    out.push({ id, label, text, order });
  }

  return out;
}

export function normalizeAdminQuestionUpdate(input, existingQuestion) {
  const text = normalizeText(input?.text ?? existingQuestion?.text);
  if (!text) {
    throw new Error("Question text is required.");
  }

  const modelAnswer = normalizeText(input?.model_answer ?? existingQuestion?.model_answer);
  const tags = normalizeTagList(input?.tags ?? existingQuestion?.tags, existingQuestion?.chapter);
  const update = {
    text,
    model_answer: modelAnswer,
    tags
  };

  if (existingQuestion?.type === "open_text") {
    const subQuestions = normalizeSubQuestions(
      input?.sub_questions ?? existingQuestion?.sub_questions ?? []
    );
    if (subQuestions.length === 0) {
      throw new Error("Open-text question requires at least one sub-question.");
    }
    update.sub_questions = subQuestions;
  }

  return update;
}
