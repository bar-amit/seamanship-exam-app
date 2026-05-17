function isNonEmptyText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeSubGrades(subGrades = {}, subQuestions = []) {
  const out = {};
  for (const sub of subQuestions) {
    const key = sub.id;
    out[key] = Boolean(subGrades[key]);
  }
  return out;
}

export function createQuestionResponse(question, extraFields = {}) {
  const base =
    question?.type === "open_text"
      ? { text: "", subGrades: {}, skipped: false }
      : { choiceId: "", skipped: false };

  return {
    ...base,
    ...extraFields
  };
}

export function createQuestionResponses(questions, extraFields = {}) {
  return (questions ?? []).map((question) => createQuestionResponse(question, extraFields));
}

export function updateResponseAtIndex(responses, index, next) {
  return (responses ?? []).map((response, idx) =>
    idx === index ? { ...response, ...next } : response
  );
}

export function setSubGradeAtIndex(responses, index, subId, checked) {
  return (responses ?? []).map((response, idx) => {
    if (idx !== index) {
      return response;
    }
    return {
      ...response,
      subGrades: {
        ...(response?.subGrades ?? {}),
        [subId]: checked
      }
    };
  });
}

export function hasAttempt(question, response) {
  if (!response || response.skipped) {
    return false;
  }

  if (question.type === "mcq") {
    return isNonEmptyText(response.choiceId);
  }

  if (question.type === "open_text") {
    return isNonEmptyText(response.text);
  }

  return false;
}

export function scoreQuestion(question, response) {
  if (!response || response.skipped) {
    return 0;
  }

  if (question.type === "mcq") {
    return response.choiceId === question.correct_choice_id ? 100 : 0;
  }

  if (question.type === "open_text") {
    const subQuestions = question.sub_questions ?? [];
    if (subQuestions.length === 0) {
      return 0;
    }
    const normalized = normalizeSubGrades(response.subGrades, subQuestions);
    const correct = Object.values(normalized).filter(Boolean).length;
    return (correct / subQuestions.length) * 100;
  }

  return 0;
}

export function scoreSession(questions, responses) {
  if (!Array.isArray(questions) || questions.length === 0) {
    return 0;
  }
  const total = questions.reduce((acc, q, i) => acc + scoreQuestion(q, responses?.[i]), 0);
  return total / questions.length;
}

export function getQuestionStatus(question, response, isCurrent) {
  if (isCurrent) {
    return "current";
  }
  if (!response) {
    return "unanswered";
  }
  if (response.skipped) {
    return "skipped";
  }
  if (hasAttempt(question, response)) {
    return "answered";
  }
  return "unanswered";
}

export function getNextQuestionIndex(index, questionCount) {
  const current = Math.max(0, Number(index) || 0);
  const last = Math.max(0, Number(questionCount) - 1);
  return Math.min(current + 1, last);
}
