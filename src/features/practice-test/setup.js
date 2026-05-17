import { createQuestionResponses } from "./session.js";

const ALLOWED_QUESTION_COUNTS = [5, 10, 20];

export function formatPracticeSeconds(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function clampPracticeMinutes(value) {
  if (!Number.isFinite(value)) {
    return 6;
  }
  return Math.min(20, Math.max(1, Math.round(value)));
}

export function normalizePracticeQuestionCount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 10;
  }
  if (ALLOWED_QUESTION_COUNTS.includes(parsed)) {
    return parsed;
  }
  return ALLOWED_QUESTION_COUNTS.reduce(
    (closest, current) =>
      Math.abs(current - parsed) < Math.abs(closest - parsed) ? current : closest,
    ALLOWED_QUESTION_COUNTS[0]
  );
}

export function clampCurrentIndex(index, questionCount) {
  return Math.max(0, Math.min(Number(index) || 0, Math.max(0, Number(questionCount) - 1)));
}

export function buildPracticeStartState({
  questionCount,
  minutesPerQuestion,
  questions,
  now = Date.now
}) {
  const safeMinutes = clampPracticeMinutes(minutesPerQuestion);

  return {
    safeMinutes,
    minutesWereClamped: safeMinutes !== minutesPerQuestion,
    questions,
    responses: createQuestionResponses(questions),
    currentIndex: 0,
    timeLeft: questionCount * safeMinutes * 60,
    sessionStartedAt: now(),
    summarySaved: false,
    phase: "active"
  };
}
