"use client";

const STATUS_LABEL = {
  correct: "נכונה",
  partial: "חלקית",
  incorrect: "שגויה",
  skipped: "דולגה",
  unanswered: "ללא מענה",
  current: "נוכחית"
};

export default function ReviewStatusBadge({ status }) {
  return <p className={`review-status status-${status}`}>סטטוס: {STATUS_LABEL[status] ?? status}</p>;
}
