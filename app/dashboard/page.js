"use client";

import { useEffect, useMemo, useState } from "react";
import { uiText } from "../../src/content/strings.js";
import PageHeader from "../../src/components/page-header.js";

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

  const perTag = useMemo(() => progress?.perTag ?? [], [progress]);

  return (
    <main>
      <PageHeader title={uiText.dashboard.title} subtitle={uiText.dashboard.subtitle} />

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
                      <strong>{uiText.dashboard.cards.lastPracticeCountLabel}</strong>{" "}
                      {progress.questionCount ?? 0}
                    </p>
                    <p>
                      <strong>{uiText.dashboard.cards.reviewedLabel}</strong> {progress.reviewedCount ?? 0}
                    </p>
                    <p>
                      <strong>{uiText.dashboard.cards.reviewedAverageLabel}</strong>{" "}
                      {formatPercent(progress.averageReviewedScore)}
                    </p>
                    <p className="muted">
                      {uiText.dashboard.cards.updatedAtLabel}{" "}
                      {progress.updated_at
                        ? new Date(progress.updated_at).toLocaleString("he-IL")
                        : uiText.dashboard.cards.updatedAtUnavailable}
                    </p>
                    {perTag.map((tag) => (
                      <article key={tag.tag} className="review-item">
                        <h4>{tag.tag}</h4>
                        <p>
                          <strong>{uiText.dashboard.cards.attemptsLabel}</strong> {tag.attempts}
                        </p>
                        <p>
                          <strong>{uiText.dashboard.cards.averageScoreLabel}</strong>{" "}
                          {formatPercent(tag.averageScore)}
                        </p>
                      </article>
                    ))}
                  </>
                )}
              </article>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
