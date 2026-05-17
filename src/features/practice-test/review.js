import { hasAttempt, scoreQuestion } from "./session.js";

export function getReviewStatus(question, response) {
  if (!response) {
    return "unanswered";
  }
  if (response.skipped) {
    return "skipped";
  }
  if (!hasAttempt(question, response)) {
    return "unanswered";
  }

  if (question.type === "mcq") {
    return response.choiceId === question.correct_choice_id ? "correct" : "incorrect";
  }

  const score = scoreQuestion(question, response);
  if (score >= 100) {
    return "correct";
  }
  if (score <= 0) {
    return "incorrect";
  }
  return "partial";
}

export function buildReviewSummary(questions, responses) {
  const summary = {
    total: questions.length,
    unanswered: 0,
    skipped: 0,
    correct: 0,
    incorrect: 0,
    partial: 0
  };

  for (let i = 0; i < questions.length; i += 1) {
    const status = getReviewStatus(questions[i], responses?.[i]);
    summary[status] += 1;
  }
  return summary;
}

export function shouldIncludeByFilter(status, filter) {
  if (filter === "all") {
    return true;
  }
  if (filter === "mistakes") {
    return status === "incorrect" || status === "partial";
  }
  if (filter === "skipped") {
    return status === "skipped";
  }
  if (filter === "correct") {
    return status === "correct";
  }
  return true;
}

export function getFilteredReviewIndexes(questions = [], responses = [], filter = "all") {
  const indexes = [];
  for (let i = 0; i < questions.length; i += 1) {
    const status = getReviewStatus(questions[i], responses?.[i]);
    if (shouldIncludeByFilter(status, filter)) {
      indexes.push(i);
    }
  }
  return indexes;
}
