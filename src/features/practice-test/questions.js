import { selectRandomItems } from "../../lib/questions/selection.js";

export function normalizePracticeQuestionLimit(value) {
  const parsed = Number(value || 10);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(50, parsed)) : 10;
}

export function selectPracticeQuestions(questions, { count, random } = {}) {
  return selectRandomItems(questions, { count, random });
}
