import { uiText } from "../../content/strings.js";

export const CHAPTER_TAG_OPTIONS = uiText.practiceTags.tagOptions;

export function normalizeSelectedTags(selectedTags = []) {
  const cleaned = Array.from(
    new Set(
      selectedTags
        .map((tag) => String(tag).trim().toLowerCase())
        .filter(Boolean)
    )
  );
  if (cleaned.includes("all")) {
    return [];
  }
  return cleaned;
}

export function filterQuestionsByTags(questions, selectedTags) {
  const normalized = normalizeSelectedTags(selectedTags);
  if (normalized.length === 0) {
    return questions;
  }
  return questions.filter((q) => {
    const tags = (q.tags ?? []).map((tag) => String(tag).toLowerCase());
    return normalized.some((tag) => tags.includes(tag));
  });
}
