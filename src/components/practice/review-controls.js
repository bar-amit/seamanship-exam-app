"use client";

import { uiText } from "../../content/strings.js";

export default function ReviewControls({
  reviewFilter,
  setReviewFilter,
  showExplanations,
  setShowExplanations
}) {
  return (
    <div className="review-controls">
      <label>
        {uiText.review.controls.filterLabel}
        <select value={reviewFilter} onChange={(e) => setReviewFilter(e.target.value)}>
          <option value="all">{uiText.review.controls.options.all}</option>
          <option value="mistakes">{uiText.review.controls.options.mistakes}</option>
          <option value="skipped">{uiText.review.controls.options.skipped}</option>
          <option value="correct">{uiText.review.controls.options.correct}</option>
        </select>
      </label>
      <label className="practice-inline">
        <input
          type="checkbox"
          checked={showExplanations}
          onChange={(e) => setShowExplanations(e.target.checked)}
        />
        {uiText.review.controls.showExplanations}
      </label>
    </div>
  );
}
