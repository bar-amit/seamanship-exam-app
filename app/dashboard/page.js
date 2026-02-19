"use client";

import { useEffect, useState } from "react";

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
          throw new Error(collectionsData.error || "Failed to load collections summary");
        }
        if (!progressRes.ok || !progressData.ok) {
          throw new Error(progressData.error || "Failed to load progress summary");
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
        <h1>לוח משתמש</h1>
        <p className="muted">תקציר מהיר של האוספים והתקדמות לפי תגיות.</p>
      </section>

      <section className="card practice-block">
        {isLoading && <p className="muted">טוען...</p>}
        {error && <p className="error">{error}</p>}
        {!isLoading && !error && (
          <>
            <div className="review-list">
              <article className="review-item">
                <h3>אוספים</h3>
                <p>
                  <strong>סה״כ אוספים:</strong> {collectionsCount}
                </p>
                <p>
                  <a href="/collections">מעבר לאוספים</a>
                </p>
              </article>

              <article className="review-item">
                <h3>התקדמות לפי תגיות</h3>
                {!progress && <p className="muted">אין נתוני התקדמות שמורים עדיין.</p>}
                {progress && (
                  <>
                    <p>
                      <strong>שאלות שנסקרו:</strong> {progress.reviewedCount ?? 0}
                    </p>
                    <p>
                      <strong>ממוצע נסקרות:</strong> {formatPercent(progress.averageReviewedScore)}
                    </p>
                    {topTags.map((tag) => (
                      <p key={tag.tag}>
                        {tag.tag}: {formatPercent(tag.averageScore)}
                      </p>
                    ))}
                  </>
                )}
                <p>
                  <a href="/progress">מעבר להתקדמות מלאה</a>
                </p>
              </article>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
