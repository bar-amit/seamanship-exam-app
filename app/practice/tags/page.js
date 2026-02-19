"use client";

import { useEffect, useMemo, useState } from "react";
import { CHAPTER_TAG_OPTIONS, normalizeSelectedTags } from "../../../src/lib/practice/tags.js";
import { scoreQuestion } from "../../../src/lib/practice/session.js";
import { buildReviewSummary, getReviewStatus } from "../../../src/lib/practice/review.js";
import {
  clearPersistedTagPractice,
  loadTagPracticeSession,
  saveTagPracticeSession
} from "../../../src/lib/practice/persistence.js";
import {
  buildTagProgressSnapshot,
  saveTagProgressSnapshot
} from "../../../src/lib/practice/analytics.js";
import ClickableStorageImage from "../../../src/components/clickable-storage-image.js";
import ReviewSummary from "../../../src/components/practice/review-summary.js";
import ReviewStatusBadge from "../../../src/components/practice/review-status-badge.js";

function createResponse(question) {
  if (question.type === "open_text") {
    return { text: "", subGrades: {}, revealed: false, skipped: false };
  }
  return { choiceId: "", revealed: false, skipped: false };
}

export default function TagPracticePage() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showStudyAids, setShowStudyAids] = useState(false);
  const [count, setCount] = useState(30);
  const [hydrated, setHydrated] = useState(false);

  const currentQuestion = questions[currentIndex];
  const currentResponse = responses[currentIndex];

  const reviewedCount = useMemo(
    () => responses.filter((r) => r?.revealed || r?.skipped).length,
    [responses]
  );

  const averageReviewedScore = useMemo(() => {
    const reviewed = questions
      .map((q, idx) => ({ q, r: responses[idx] }))
      .filter((item) => item.r?.revealed || item.r?.skipped);
    if (reviewed.length === 0) {
      return 0;
    }
    const total = reviewed.reduce((sum, item) => sum + scoreQuestion(item.q, item.r), 0);
    return total / reviewed.length;
  }, [questions, responses]);

  const reviewSummary = useMemo(
    () => buildReviewSummary(questions, responses),
    [questions, responses]
  );
  const progressSnapshot = useMemo(
    () =>
      buildTagProgressSnapshot({
        questions,
        responses,
        selectedTags
      }),
    [questions, responses, selectedTags]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const restored = loadTagPracticeSession(window.localStorage);
    if (restored) {
      setSelectedTags(restored.selectedTags);
      setCount(Math.max(5, Math.min(200, restored.count)));
      setShowStudyAids(restored.showStudyAids);
      setQuestions(restored.questions);
      setResponses(restored.responses);
      setCurrentIndex(
        Math.max(0, Math.min(restored.currentIndex, Math.max(0, restored.questions.length - 1)))
      );
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    const timer = setTimeout(() => {
      saveTagPracticeSession(window.localStorage, {
        selectedTags,
        count,
        showStudyAids,
        questions,
        responses,
        currentIndex
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [hydrated, selectedTags, count, showStudyAids, questions, responses, currentIndex]);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    const timer = setTimeout(() => {
      saveTagProgressSnapshot(window.localStorage, progressSnapshot);
    }, 250);
    return () => clearTimeout(timer);
  }, [hydrated, progressSnapshot]);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    // Best-effort server sync for authenticated users.
    const timer = setTimeout(async () => {
      try {
        await fetch("/api/progress/tag", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(progressSnapshot)
        });
      } catch {
        // Ignore sync errors during practice; local snapshot remains source of truth.
      }
    }, 900);

    return () => clearTimeout(timer);
  }, [hydrated, progressSnapshot]);

  function toggleTag(tagId) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    );
  }

  async function startTagPractice() {
    setIsLoading(true);
    setError("");
    try {
      const normalized = normalizeSelectedTags(selectedTags);
      const query = new URLSearchParams();
      query.set("count", String(count));
      if (normalized.length > 0) {
        query.set("tags", normalized.join(","));
      } else {
        query.set("tags", "all");
      }
      const res = await fetch(`/api/practice/tag-questions?${query.toString()}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to load tag practice questions");
      }
      setQuestions(data.questions);
      setResponses(data.questions.map((q) => createResponse(q)));
      setCurrentIndex(0);
      setShowStudyAids(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateCurrentResponse(next) {
    setResponses((prev) => prev.map((r, idx) => (idx === currentIndex ? { ...r, ...next } : r)));
  }

  function toggleSubGrade(subId, checked) {
    setResponses((prev) =>
      prev.map((r, idx) =>
        idx === currentIndex
          ? {
              ...r,
              subGrades: {
                ...(r.subGrades ?? {}),
                [subId]: checked
              }
            }
          : r
      )
    );
  }

  function markReviewed() {
    updateCurrentResponse({ revealed: true, skipped: false });
  }

  function markSkipped() {
    updateCurrentResponse({ skipped: true, revealed: true });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((idx) => idx + 1);
    }
  }

  return (
    <main>
      <section className="card">
        <h1>תרגול לפי תגיות (מצב לימוד)</h1>
        <p className="muted">
          עזרי לימוד מוסתרים כברירת מחדל, עם חשיפה מהירה במהלך תרגול.
        </p>
      </section>

      <section className="card practice-block">
        <h2>הגדרות תרגול</h2>
        <label>
          מספר שאלות
          <input
            type="number"
            min={5}
            max={200}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </label>

        <div>
          <strong>בחר תגיות</strong>
          <div className="choices-list">
            {CHAPTER_TAG_OPTIONS.map((tag) => (
              <label className="practice-inline" key={tag.id}>
                <input
                  type="checkbox"
                  checked={selectedTags.includes(tag.id)}
                  onChange={() => toggleTag(tag.id)}
                />
                {tag.label}
              </label>
            ))}
            <label className="practice-inline">
              <input
                type="checkbox"
                checked={selectedTags.length === 0}
                onChange={() => setSelectedTags([])}
              />
              כל התגיות
            </label>
          </div>
        </div>

        <button onClick={startTagPractice} disabled={isLoading}>
          {isLoading ? "טוען..." : "התחל תרגול תגיות"}
        </button>
        {error && <p className="error">{error}</p>}
      </section>

      {currentQuestion && (
        <>
          <section className="card practice-block">
            <div className="practice-topbar">
              <strong>
                שאלה {currentIndex + 1} מתוך {questions.length}
              </strong>
              <span>
                נסקרו {reviewedCount}/{questions.length}
              </span>
            </div>

            <label className="practice-inline">
              <input
                type="checkbox"
                checked={showStudyAids}
                onChange={(e) => setShowStudyAids(e.target.checked)}
              />
              הצג עזרי לימוד
            </label>

            <div className="prompt-row">
              <p>{currentQuestion.text}</p>
              <ClickableStorageImage
                imageStoragePath={currentQuestion.image_storage_path}
                imageRef={currentQuestion.image_ref}
                alt={`תמונה לשאלה ${currentQuestion.id}`}
                className="question-image inline-thumb"
              />
            </div>

            {currentQuestion.type === "mcq" && (
              <div className="choices-list">
                {currentQuestion.choices.map((choice) => (
                  <label key={choice.id} className="choice-item">
                    <input
                      type="radio"
                      name={`tag-q-${currentQuestion.id}`}
                      checked={currentResponse?.choiceId === choice.id}
                      onChange={() => updateCurrentResponse({ choiceId: choice.id, skipped: false })}
                    />
                    <span className="choice-text">
                      {choice.label}. {choice.text}
                    </span>
                    <ClickableStorageImage
                      imageStoragePath={choice.image_storage_path}
                      imageRef={choice.image_ref}
                      alt={`תמונה לאפשרות ${choice.label}`}
                      className="choice-image inline-thumb"
                    />
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === "open_text" && (
              <>
                <textarea
                  rows={5}
                  value={currentResponse?.text ?? ""}
                  onChange={(e) => updateCurrentResponse({ text: e.target.value, skipped: false })}
                  placeholder="כתוב תשובה חופשית"
                />
                <div className="subgrade-list">
                  <strong>סמן סעיפים שנענו נכונה (לבדיקה עצמית)</strong>
                  {(currentQuestion.sub_questions ?? []).map((sub) => (
                    <label key={sub.id} className="practice-inline">
                      <input
                        type="checkbox"
                        checked={Boolean(currentResponse?.subGrades?.[sub.id])}
                        onChange={(e) => toggleSubGrade(sub.id, e.target.checked)}
                      />
                      {sub.label}. {sub.text}
                    </label>
                  ))}
                </div>
              </>
            )}

            <div className="practice-actions">
              <button onClick={markReviewed}>בדוק שאלה</button>
              <button onClick={markSkipped}>דלג</button>
              <button onClick={nextQuestion}>הבא</button>
            </div>

            {(showStudyAids || currentResponse?.revealed) && (
              <div className="review-item">
                <ReviewStatusBadge status={getReviewStatus(currentQuestion, currentResponse)} />
                <p>
                  <strong>תשובה נכונה:</strong>{" "}
                  {currentQuestion.type === "mcq"
                    ? currentQuestion.correct_choice_id
                    : "בדיקה עצמית לפי הסעיפים"}
                </p>
                {currentQuestion.model_answer && (
                  <>
                    <strong>הסבר:</strong>
                    <p>{currentQuestion.model_answer}</p>
                  </>
                )}
                <p>
                  <strong>תגיות:</strong> {(currentQuestion.tags ?? []).join(", ")}
                </p>
                <p>
                  <strong>ניקוד לשאלה:</strong> {scoreQuestion(currentQuestion, currentResponse).toFixed(1)}%
                </p>
              </div>
            )}
          </section>

          <section className="card practice-block">
            <h3>ניווט מהיר</h3>
            <div className="navigator-grid">
              {questions.map((q, idx) => {
                const status = idx === currentIndex ? "current" : getReviewStatus(q, responses[idx]);
                return (
                  <button
                    key={q.id}
                    className={`navigator-dot status-${status}`}
                    onClick={() => setCurrentIndex(idx)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            <ReviewSummary summary={reviewSummary} />
            <p>
              ניקוד ממוצע: <strong>{averageReviewedScore.toFixed(1)}%</strong>
            </p>
          </section>
        </>
      )}
    </main>
  );
}
