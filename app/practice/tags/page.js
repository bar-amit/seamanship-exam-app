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
import AddToCollectionModal from "../../../src/components/add-to-collection-modal.js";
import PageHeader from "../../../src/components/page-header.js";
import { uiText } from "../../../src/content/strings.js";

function createResponse(question) {
  if (question.type === "open_text") {
    return { text: "", subGrades: {}, revealed: false, skipped: false, studyAidsOpen: false };
  }
  return { choiceId: "", revealed: false, skipped: false, studyAidsOpen: false };
}

export default function TagPracticePage() {
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [count, setCount] = useState(30);
  const [hydrated, setHydrated] = useState(false);
  const [collectionTargetQuestionId, setCollectionTargetQuestionId] = useState("");

  const currentQuestion = questions[currentIndex];
  const currentResponse = responses[currentIndex];
  const showStudyAids = Boolean(currentResponse?.studyAidsOpen);
  const hasStartedSession = questions.length > 0;

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
      setQuestions(restored.questions);
      setResponses(
        (restored.responses ?? []).map((response) => ({
          ...response,
          studyAidsOpen: Boolean(response?.studyAidsOpen)
        }))
      );
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
        questions,
        responses,
        currentIndex
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [hydrated, selectedTags, count, questions, responses, currentIndex]);

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
        throw new Error(data.error || uiText.practiceTags.errors.loadQuestionsFailed);
      }
      setQuestions(data.questions);
      setResponses(data.questions.map((q) => createResponse(q)));
      setCurrentIndex(0);
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

  function resetToSetup() {
    setQuestions([]);
    setResponses([]);
    setCurrentIndex(0);
    setError("");
    if (typeof window !== "undefined") {
      clearPersistedTagPractice(window.localStorage);
    }
  }

  function toggleCurrentStudyAids() {
    setResponses((prev) =>
      prev.map((r, idx) =>
        idx === currentIndex
          ? {
              ...r,
              studyAidsOpen: !Boolean(r?.studyAidsOpen)
            }
          : r
      )
    );
  }

  return (
    <main>
      <PageHeader title={uiText.practiceTags.title} />

      {!hasStartedSession && (
        <section className="card practice-block">
          <h2>{uiText.practiceTags.setupTitle}</h2>
          <label>
            {uiText.practiceTags.countLabel}
            <input
              type="number"
              min={5}
              max={200}
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
            />
          </label>

          <div className="tag-setup-group">
            <strong className="tag-setup-title">{uiText.practiceTags.selectTagsLabel}</strong>
            <div className="choices-list tag-chip-list">
              {CHAPTER_TAG_OPTIONS.map((tag) => (
                <label className="tag-chip" key={tag.id}>
                  <input
                    type="checkbox"
                    checked={selectedTags.includes(tag.id)}
                    onChange={() => toggleTag(tag.id)}
                  />
                  {tag.label}
                </label>
              ))}
            </div>
            <div className="tag-chip-divider" />
            <div className="tag-chip-select-all">
              <label className="tag-chip tag-chip-all">
                <input
                  type="checkbox"
                  checked={selectedTags.length === 0}
                  onChange={() => setSelectedTags([])}
                />
                {uiText.practiceTags.allTags}
              </label>
            </div>
          </div>

          <button onClick={startTagPractice} disabled={isLoading}>
            {isLoading ? uiText.practiceTags.startLoading : uiText.practiceTags.start}
          </button>
          {error && <p className="error">{error}</p>}
        </section>
      )}

      {currentQuestion && (
        <>
          <section className="card practice-block">
            <div className="practice-topbar">
              <strong>
                {uiText.practiceTags.questionProgressPrefix} {currentIndex + 1}{" "}
                {uiText.practiceTags.questionProgressOutOf} {questions.length}
              </strong>
              <span>
                {uiText.practiceTags.reviewedPrefix} {reviewedCount}/{questions.length}
              </span>
            </div>
            <div className="study-tools-row">
              <button
                type="button"
                className={`study-aids-toggle${showStudyAids ? " is-active" : ""}`}
                onClick={toggleCurrentStudyAids}
              >
                {showStudyAids ? uiText.practiceTags.hideStudyAids : uiText.practiceTags.showStudyAids}
              </button>
              <button type="button" className="study-aids-toggle is-secondary" onClick={resetToSetup}>
                {uiText.practiceTags.buttons.resetToSetup}
              </button>
            </div>
            <div className="prompt-row">
              <p>{currentQuestion.text}</p>
              <ClickableStorageImage
                imageStoragePath={currentQuestion.image_storage_path}
                imageRef={currentQuestion.image_ref}
                alt={uiText.practiceTags.altQuestionImage(currentQuestion.id)}
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
                      alt={uiText.practiceTags.altChoiceImage(choice.label)}
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
                  placeholder={uiText.practiceTags.openTextPlaceholder}
                />
                <div className="subgrade-list">
                  <strong>{uiText.practiceTags.subGradeInstruction}</strong>
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
              <button onClick={markReviewed}>{uiText.practiceTags.buttons.markReviewed}</button>
              <button onClick={markSkipped}>{uiText.practiceTags.buttons.skip}</button>
              <button onClick={nextQuestion}>{uiText.practiceTags.buttons.next}</button>
            </div>

            {(showStudyAids || currentResponse?.revealed) && (
              <div className="review-item">
                <ReviewStatusBadge status={getReviewStatus(currentQuestion, currentResponse)} />
                <p>
                  <strong>{uiText.practiceTags.correctAnswerLabel}</strong>{" "}
                  {currentQuestion.type === "mcq"
                    ? currentQuestion.correct_choice_id
                    : uiText.practiceTags.openTextCorrectAnswerFallback}
                </p>
                {currentQuestion.model_answer && (
                  <>
                    <strong>{uiText.practiceTags.explanationLabel}</strong>
                    <p>{currentQuestion.model_answer}</p>
                  </>
                )}
                <p>
                  <strong>{uiText.practiceTags.tagsLabel}</strong> {(currentQuestion.tags ?? []).join(", ")}
                </p>
                <p>
                  <strong>{uiText.practiceTags.questionScoreLabel}</strong>{" "}
                  {scoreQuestion(currentQuestion, currentResponse).toFixed(1)}%
                </p>
                <button type="button" onClick={() => setCollectionTargetQuestionId(currentQuestion.id)}>
                  {uiText.collections.addModal.trigger}
                </button>
              </div>
            )}
          </section>

          <section className="card practice-block">
            <h3>{uiText.practiceTags.quickNavTitle}</h3>
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
              {uiText.practiceTags.averageScoreLabel} <strong>{averageReviewedScore.toFixed(1)}%</strong>
            </p>
          </section>
        </>
      )}
      <AddToCollectionModal
        isOpen={Boolean(collectionTargetQuestionId)}
        questionId={collectionTargetQuestionId}
        onClose={() => setCollectionTargetQuestionId("")}
      />
    </main>
  );
}
