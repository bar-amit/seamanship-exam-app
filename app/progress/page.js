"use client";

import { useEffect, useMemo, useState } from "react";

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
          throw new Error(data.error || "Failed to load progress");
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
        <h1>התקדמות לפי תגיות</h1>
        <p className="muted">הנתונים נשמרים למשתמש המחובר ומעודכנים מתרגול לפי תגיות.</p>
      </section>

      <section className="card practice-block">
        {isLoading && <p className="muted">טוען...</p>}
        {error && <p className="error">{error}</p>}

        {!isLoading && !error && !progress && (
          <p className="muted">אין נתוני התקדמות שמורים עדיין. בצע תרגול לפי תגיות כדי ליצור נתונים.</p>
        )}

        {!isLoading && !error && progress && (
          <>
            <p>
              <strong>שאלות בתרגול האחרון:</strong> {progress.questionCount ?? 0}
            </p>
            <p>
              <strong>שאלות שנסקרו:</strong> {progress.reviewedCount ?? 0}
            </p>
            <p>
              <strong>ציון ממוצע (נסקרו):</strong> {formatPercent(progress.averageReviewedScore)}
            </p>
            <p className="muted">
              עודכן לאחרונה:{" "}
              {progress.updated_at ? new Date(progress.updated_at).toLocaleString("he-IL") : "לא זמין"}
            </p>

            <div className="review-list">
              {perTag.map((row) => (
                <article key={row.tag} className="review-item">
                  <h3>{row.tag}</h3>
                  <p>
                    <strong>ניסיונות:</strong> {row.attempts}
                  </p>
                  <p>
                    <strong>ציון ממוצע:</strong> {formatPercent(row.averageScore)}
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
