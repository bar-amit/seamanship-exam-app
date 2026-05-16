import { scoreQuestion } from "../practice-test/session.js";

export function clampTagPracticeCount(value) {
  return Math.max(5, Math.min(200, Number(value)));
}

export function restoreTagPracticeResponses(responses = []) {
  return responses.map((response) => ({
    ...response,
    studyAidsOpen: Boolean(response?.studyAidsOpen)
  }));
}

export function countReviewedResponses(responses = []) {
  return responses.filter((response) => response?.revealed || response?.skipped).length;
}

export function getReviewedItems(questions = [], responses = []) {
  return questions
    .map((question, idx) => ({ question, response: responses[idx] }))
    .filter((item) => item.response?.revealed || item.response?.skipped);
}

export function getAverageReviewedScore(questions = [], responses = []) {
  const reviewed = getReviewedItems(questions, responses);
  if (reviewed.length === 0) {
    return 0;
  }
  const total = reviewed.reduce(
    (sum, item) => sum + scoreQuestion(item.question, item.response),
    0
  );
  return total / reviewed.length;
}

export function buildTagQuestionsQuery({ count, selectedTags }) {
  const query = new URLSearchParams();
  query.set("count", String(count));
  if (selectedTags.length > 0) {
    query.set("tags", selectedTags.join(","));
  } else {
    query.set("tags", "all");
  }
  return query;
}
