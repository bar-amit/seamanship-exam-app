import { selectRandomItems } from "../../lib/questions/selection.js";
import { filterQuestionsByTags, normalizeSelectedTags } from "./tags.js";

export function normalizeTagQuestionRequest({ countParam, tagsParam } = {}) {
  const parsed = Number(countParam || 30);
  const count = Number.isFinite(parsed) ? Math.max(1, Math.min(200, parsed)) : 30;
  const trimmedTags = String(tagsParam || "").trim();
  const selectedTags = trimmedTags ? trimmedTags.split(",") : [];

  return {
    count,
    selectedTags: normalizeSelectedTags(selectedTags)
  };
}

export function selectTagPracticeQuestions(questions, { count, selectedTags, random } = {}) {
  const filtered = filterQuestionsByTags(questions, selectedTags);

  return {
    requestedTags: selectedTags,
    totalPool: filtered.length,
    questions: selectRandomItems(filtered, { count, random })
  };
}
