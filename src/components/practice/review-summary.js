"use client";

import { uiText } from "../../content/strings.js";

export default function ReviewSummary({ summary }) {
  if (!summary) {
    return null;
  }

  return (
    <div className="review-summary">
      <span>{uiText.review.summary.labels.correct}: {summary.correct}</span>
      <span>{uiText.review.summary.labels.partial}: {summary.partial}</span>
      <span>{uiText.review.summary.labels.incorrect}: {summary.incorrect}</span>
      <span>{uiText.review.summary.labels.skipped}: {summary.skipped}</span>
      <span>{uiText.review.summary.labels.unanswered}: {summary.unanswered}</span>
    </div>
  );
}
