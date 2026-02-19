"use client";

export default function ReviewControls({
  reviewFilter,
  setReviewFilter,
  showExplanations,
  setShowExplanations
}) {
  return (
    <div className="review-controls">
      <label>
        סינון
        <select value={reviewFilter} onChange={(e) => setReviewFilter(e.target.value)}>
          <option value="all">הכל</option>
          <option value="mistakes">טעויות וחלקיות</option>
          <option value="skipped">דילוגים</option>
          <option value="correct">נכונות</option>
        </select>
      </label>
      <label className="practice-inline">
        <input
          type="checkbox"
          checked={showExplanations}
          onChange={(e) => setShowExplanations(e.target.checked)}
        />
        הצג הסברים
      </label>
    </div>
  );
}
