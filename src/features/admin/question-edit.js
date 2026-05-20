const HEBREW_LABELS = {
  a: "א",
  b: "ב",
  c: "ג",
  d: "ד"
};

function normalizeText(value) {
  return String(value ?? "").trim();
}

function toStoragePath(imageRef, storagePrefix = "question-assets") {
  if (!imageRef) {
    return null;
  }
  return `${storagePrefix}/${imageRef}`.replace(/\/+/g, "/");
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

function normalizeStringList(value) {
  const rawValues = Array.isArray(value)
    ? value
    : String(value ?? "")
        .split(/[\n,]/)
        .map((item) => item.trim());

  return Array.from(
    new Set(
      rawValues
        .map((item) => normalizeText(item))
        .filter(Boolean)
    )
  );
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

function normalizeSubAnswers(subAnswers, subQuestions) {
  const rows = Array.isArray(subAnswers) ? subAnswers : [];

  if (subQuestions.length > 0) {
    return subQuestions.map((subQuestion, index) => {
      const row = rows[index] ?? {};
      return {
        id: subQuestion.id,
        label: subQuestion.label,
        text: normalizeText(row?.text),
        order: subQuestion.order
      };
    });
  }

  return rows
    .map((row, index) => {
      const text = normalizeText(row?.text);
      if (!text) {
        return null;
      }
      const id = normalizeSubQuestionId(row?.id, index);
      const label = normalizeText(row?.label) || HEBREW_LABELS[id] || id.toUpperCase();
      const rawOrder = Number(row?.order);
      const order = Number.isFinite(rawOrder) ? Math.max(1, Math.round(rawOrder)) : index + 1;
      return { id, label, text, order };
    })
    .filter(Boolean);
}

function normalizeChoiceId(value, index) {
  const parsed = normalizeText(value).toLowerCase();
  if (parsed) {
    return parsed;
  }
  return String.fromCharCode("a".charCodeAt(0) + index);
}

function normalizeChoices(choices) {
  const rows = Array.isArray(choices) ? choices : [];
  const map = new Map();
  let index = 0;

  for (const row of rows) {
    const text = normalizeText(row?.text);
    const label = normalizeText(row?.label);
    const imageRef = normalizeText(row?.image_ref);

    // Ignore fully empty draft rows.
    if (!text && !label && !normalizeText(row?.id) && !imageRef) {
      continue;
    }

    if (!text) {
      throw new Error("Each choice must include text.");
    }

    const id = normalizeChoiceId(row?.id, index);
    index += 1;
    map.set(id, {
      id,
      label: label || id.toUpperCase(),
      text,
      image_ref: imageRef || null,
      image_storage_path: imageRef ? toStoragePath(imageRef) : null
    });
  }

  return Array.from(map.values());
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

  if (input?.image_refs !== undefined) {
    const imageRefs = normalizeStringList(input.image_refs);
    update.image_refs = imageRefs;
    update.image_storage_paths = imageRefs.map((imageRef) => toStoragePath(imageRef));
    update.image_ref = imageRefs[0] ?? null;
    update.image_storage_path = imageRefs[0] ? toStoragePath(imageRefs[0]) : null;
  }

  if (input?.references_sq11_positioning_diagram !== undefined) {
    update.references_sq11_positioning_diagram = Boolean(input.references_sq11_positioning_diagram);
  }

  if (existingQuestion?.type === "open_text") {
    const subQuestions = normalizeSubQuestions(
      input?.sub_questions ?? existingQuestion?.sub_questions ?? []
    );
    update.sub_questions = subQuestions;
    if (input?.sub_answers !== undefined) {
      update.sub_answers = normalizeSubAnswers(input.sub_answers, subQuestions);
    }
  }

  if (existingQuestion?.type === "mcq") {
    const choices = normalizeChoices(input?.choices ?? existingQuestion?.choices ?? []);
    if (choices.length < 2) {
      throw new Error("MCQ requires at least two choices.");
    }

    const correctChoiceId = normalizeText(
      input?.correct_choice_id ?? existingQuestion?.correct_choice_id
    ).toLowerCase();
    if (!correctChoiceId) {
      throw new Error("Correct choice id is required.");
    }
    if (!choices.some((choice) => choice.id === correctChoiceId)) {
      throw new Error("Correct choice id must match one of the choices.");
    }

    update.choices = choices;
    update.correct_choice_id = correctChoiceId;
  }

  return update;
}
