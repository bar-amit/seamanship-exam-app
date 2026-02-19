"use client";

const LABELS = {
  correct: "נכונות",
  partial: "חלקיות",
  incorrect: "שגויות",
  skipped: "דילוגים",
  unanswered: "ללא מענה"
};

export default function ReviewSummary({ summary }) {
  if (!summary) {
    return null;
  }

  return (
    <div className="review-summary">
      <span>{LABELS.correct}: {summary.correct}</span>
      <span>{LABELS.partial}: {summary.partial}</span>
      <span>{LABELS.incorrect}: {summary.incorrect}</span>
      <span>{LABELS.skipped}: {summary.skipped}</span>
      <span>{LABELS.unanswered}: {summary.unanswered}</span>
    </div>
  );
}
