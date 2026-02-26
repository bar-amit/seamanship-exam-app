"use client";

import { uiText } from "../../content/strings.js";

export default function ReviewStatusBadge({ status }) {
  return (
    <p className={`review-status status-${status}`}>
      {uiText.review.status.prefix} {uiText.review.status.labels[status] ?? status}
    </p>
  );
}
