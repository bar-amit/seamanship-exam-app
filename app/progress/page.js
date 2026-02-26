"use client";

import { useEffect, useMemo, useState } from "react";
import { uiText } from "../../src/content/strings.js";

function formatPercent(value) {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

export default function ProgressPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const res = await fetch("/api/progress/tag");
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || uiText.progress.errors.loadFailed);
        }
        setProgress(data.progress);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const perTag = useMemo(() => progress?.perTag ?? [], [progress]);

  return (
    <main>
      <section className="card">
        <h1>{uiText.progress.title}</h1>
        <p className="muted">{uiText.progress.subtitle}</p>
      </section>

      <section className="card practice-block">
        {isLoading && <p className="muted">{uiText.common.loading}</p>}
        {error && <p className="error">{error}</p>}

        {!isLoading && !error && !progress && (
          <p className="muted">{uiText.progress.emptyState}</p>
        )}

        {!isLoading && !error && progress && (
          <>
            <p>
              <strong>{uiText.progress.lastPracticeCountLabel}</strong> {progress.questionCount ?? 0}
            </p>
            <p>
              <strong>{uiText.progress.reviewedCountLabel}</strong> {progress.reviewedCount ?? 0}
            </p>
            <p>
              <strong>{uiText.progress.averageReviewedScoreLabel}</strong>{" "}
              {formatPercent(progress.averageReviewedScore)}
            </p>
            <p className="muted">
              {uiText.progress.updatedAtLabel}{" "}
              {progress.updated_at
                ? new Date(progress.updated_at).toLocaleString("he-IL")
                : uiText.progress.updatedAtUnavailable}
            </p>

            <div className="review-list">
              {perTag.map((row) => (
                <article key={row.tag} className="review-item">
                  <h3>{row.tag}</h3>
                  <p>
                    <strong>{uiText.progress.attemptsLabel}</strong> {row.attempts}
                  </p>
                  <p>
                    <strong>{uiText.progress.averageScoreLabel}</strong> {formatPercent(row.averageScore)}
                  </p>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
