"use client";

import { useEffect, useState } from "react";
import { uiText } from "../../src/content/strings.js";

function formatPercent(value) {
  return `${Number(value ?? 0).toFixed(1)}%`;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [collectionsCount, setCollectionsCount] = useState(0);
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setError("");
      try {
        const [collectionsRes, progressRes] = await Promise.all([
          fetch("/api/collections"),
          fetch("/api/progress/tag")
        ]);
        const collectionsData = await collectionsRes.json();
        const progressData = await progressRes.json();

        if (!collectionsRes.ok || !collectionsData.ok) {
          throw new Error(collectionsData.error || uiText.dashboard.errors.collectionsSummaryFailed);
        }
        if (!progressRes.ok || !progressData.ok) {
          throw new Error(progressData.error || uiText.dashboard.errors.progressSummaryFailed);
        }

        setCollectionsCount((collectionsData.collections ?? []).length);
        setProgress(progressData.progress);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, []);

  const topTags = (progress?.perTag ?? []).slice(0, 3);

  return (
    <main>
      <section className="card">
        <h1>{uiText.dashboard.title}</h1>
        <p className="muted">{uiText.dashboard.subtitle}</p>
      </section>

      <section className="card practice-block">
        {isLoading && <p className="muted">{uiText.common.loading}</p>}
        {error && <p className="error">{error}</p>}
        {!isLoading && !error && (
          <>
            <div className="review-list">
              <article className="review-item">
                <h3>{uiText.dashboard.cards.collectionsTitle}</h3>
                <p>
                  <strong>{uiText.dashboard.cards.collectionsCountLabel}</strong> {collectionsCount}
                </p>
                <p>
                  <a href="/collections">{uiText.dashboard.cards.collectionsLink}</a>
                </p>
              </article>

              <article className="review-item">
                <h3>{uiText.dashboard.cards.progressTitle}</h3>
                {!progress && <p className="muted">{uiText.dashboard.cards.noProgress}</p>}
                {progress && (
                  <>
                    <p>
                      <strong>{uiText.dashboard.cards.reviewedLabel}</strong> {progress.reviewedCount ?? 0}
                    </p>
                    <p>
                      <strong>{uiText.dashboard.cards.reviewedAverageLabel}</strong>{" "}
                      {formatPercent(progress.averageReviewedScore)}
                    </p>
                    {topTags.map((tag) => (
                      <p key={tag.tag}>
                        {tag.tag}: {formatPercent(tag.averageScore)}
                      </p>
                    ))}
                  </>
                )}
                <p>
                  <a href="/progress">{uiText.dashboard.cards.progressLink}</a>
                </p>
              </article>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
