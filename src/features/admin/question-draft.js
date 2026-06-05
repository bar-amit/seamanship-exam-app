export function subQuestionsToDraft(subQuestions) {
  const rows = Array.isArray(subQuestions) ? subQuestions : [];
  return rows.map((row, index) => ({
    id: row.id ?? defaultRowId(index),
    label: row.label ?? "",
    text: row.text ?? "",
    order: row.order ?? index + 1
  }));
}

export function subAnswersToDraft(subAnswers, subQuestions = []) {
  const rows = Array.isArray(subAnswers) ? subAnswers : [];
  const questionRows = Array.isArray(subQuestions) ? subQuestions : [];

  if (questionRows.length > 0) {
    return questionRows.map((subQuestion, index) => {
      const row = rows[index] ?? {};
      return {
        id: subQuestion.id ?? row.id ?? defaultRowId(index),
        label: subQuestion.label ?? row.label ?? "",
        text: row.text ?? "",
        order: subQuestion.order ?? row.order ?? index + 1
      };
    });
  }

  return rows.map((row, index) => ({
    id: row.id ?? defaultRowId(index),
    label: row.label ?? "",
    text: row.text ?? "",
    order: row.order ?? index + 1
  }));
}

export function choicesToDraft(choices) {
  const rows = Array.isArray(choices) ? choices : [];
  return rows.map((row, index) => ({
    id: row.id ?? defaultRowId(index),
    label: row.label ?? "",
    text: row.text ?? "",
    image_ref: row.image_ref ?? ""
  }));
}

export function parseTags(tags) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

export function imageRefsToDraft(question) {
  const refs = Array.isArray(question?.image_refs) && question.image_refs.length > 0
    ? question.image_refs
    : [question?.image_ref].filter(Boolean);
  return refs.join("\n");
}

export function appendSubQuestionRow(rows) {
  return [
    ...rows,
    {
      id: "",
      label: "",
      text: "",
      order: rows.length + 1
    }
  ];
}

export function appendSubAnswerRow(rows) {
  return [
    ...rows,
    {
      id: "",
      label: "",
      text: "",
      order: rows.length + 1
    }
  ];
}

export function removeDraftRow(rows, index) {
  return rows.filter((_, rowIndex) => rowIndex !== index);
}

export function updateDraftRowField(rows, index, field, value) {
  return rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row));
}

export function updateSubAnswerTextAtIndex(rows, index, value) {
  const next = [...rows];
  while (next.length <= index) {
    next.push({
      id: "",
      label: "",
      text: "",
      order: next.length + 1
    });
  }
  next[index] = { ...next[index], text: value };
  return next;
}

export function appendChoiceRow(rows) {
  return [
    ...rows,
    {
      id: "",
      label: "",
      text: "",
      image_ref: ""
    }
  ];
}

function defaultRowId(index) {
  return String.fromCharCode("a".charCodeAt(0) + index);
}
