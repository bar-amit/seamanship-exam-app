"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getQuestionStatus,
  hasAttempt,
  scoreQuestion,
  scoreSession
} from "../../src/lib/practice/session.js";
import {
  buildReviewSummary,
  getReviewStatus,
  shouldIncludeByFilter
} from "../../src/lib/practice/review.js";
import {
  clearPersistedPracticeTest,
  loadPracticeTestSession,
  savePracticeTestSession
} from "../../src/lib/practice/persistence.js";
import { buildPracticeTestSummary, pushTestSummary } from "../../src/lib/practice/analytics.js";
import ClickableStorageImage from "../../src/components/clickable-storage-image.js";
import ReviewSummary from "../../src/components/practice/review-summary.js";
import ReviewControls from "../../src/components/practice/review-controls.js";
import ReviewStatusBadge from "../../src/components/practice/review-status-badge.js";
import AddToCollectionModal from "../../src/components/add-to-collection-modal.js";
import PageHeader from "../../src/components/page-header.js";
import { uiText } from "../../src/content/strings.js";

function formatSeconds(totalSeconds) {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function clampMinutes(value) {
  if (!Number.isFinite(value)) {
    return 6;
  }
  return Math.min(20, Math.max(1, Math.round(value)));
}

function normalizeQuestionCount(value) {
  const allowed = [5, 10, 20];
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 10;
  }
  if (allowed.includes(parsed)) {
    return parsed;
  }
  // Choose nearest supported option.
  return allowed.reduce(
    (closest, current) =>
      Math.abs(current - parsed) < Math.abs(closest - parsed) ? current : closest,
    allowed[0]
  );
}

function setupResponse(question) {
  if (question.type === "open_text") {
    return { text: "", subGrades: {}, skipped: false };
  }
  return { choiceId: "", skipped: false };
}

export default function PracticePage() {
  const [phase, setPhase] = useState("setup");
  const [questionCount, setQuestionCount] = useState(10);
  const [timed, setTimed] = useState(true);
  const [minutesPerQuestion, setMinutesPerQuestion] = useState(6);
  const [minutesHint, setMinutesHint] = useState("");
  const [questions, setQuestions] = useState([]);
  const [responses, setResponses] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [reviewFilter, setReviewFilter] = useState("all");
  const [showExplanations, setShowExplanations] = useState(true);
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const [summarySaved, setSummarySaved] = useState(false);
  const [collectionTargetQuestionId, setCollectionTargetQuestionId] = useState("");

  const currentQuestion = questions[currentIndex];
  const currentResponse = responses[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const canSubmitCurrent = Boolean(currentQuestion) && hasAttempt(currentQuestion, currentResponse);

  useEffect(() => {
    if (phase !== "active" || !timed) {
      return;
    }
    if (timeLeft <= 0) {
      setPhase("review");
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timed, timeLeft]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const restored = loadPracticeTestSession(window.localStorage);
    if (restored) {
      setPhase(restored.phase);
      setQuestionCount(normalizeQuestionCount(restored.questionCount));
      setTimed(restored.timed);
      setMinutesPerQuestion(clampMinutes(restored.minutesPerQuestion));
      setQuestions(restored.questions);
      setResponses(restored.responses);
      setCurrentIndex(
        Math.max(0, Math.min(restored.currentIndex, Math.max(0, restored.questions.length - 1)))
      );
      setTimeLeft(Math.max(0, restored.timeLeft));
      setSessionStartedAt(restored.sessionStartedAt ?? Date.now());
      if (restored.phase === "review") {
        setSummarySaved(true);
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") {
      return;
    }
    const timer = setTimeout(() => {
      savePracticeTestSession(window.localStorage, {
        phase,
        questionCount,
        timed,
        minutesPerQuestion,
        questions,
        responses,
        currentIndex,
        timeLeft,
        sessionStartedAt
      });
    }, 150);
    return () => clearTimeout(timer);
  }, [
    hydrated,
    phase,
    questionCount,
    timed,
    minutesPerQuestion,
    questions,
    responses,
    currentIndex,
    timeLeft,
    sessionStartedAt
  ]);

  useEffect(() => {
    if (!hydrated || phase !== "review" || summarySaved || typeof window === "undefined") {
      return;
    }
    const startedAt = sessionStartedAt ?? Date.now();
    const endedAt = Date.now();
    const summary = buildPracticeTestSummary({
      questions,
      responses,
      startedAt,
      endedAt
    });
    pushTestSummary(window.localStorage, summary);
    setSummarySaved(true);
  }, [hydrated, phase, summarySaved, questions, responses, sessionStartedAt]);

  const overallScore = useMemo(() => {
    if (phase !== "review") {
      return 0;
    }
    return scoreSession(questions, responses);
  }, [phase, questions, responses]);

  const reviewSummary = useMemo(
    () => (phase === "review" ? buildReviewSummary(questions, responses) : null),
    [phase, questions, responses]
  );

  const reviewIndexes = useMemo(() => {
    if (phase !== "review") {
      return [];
    }
    const indexes = [];
    for (let i = 0; i < questions.length; i += 1) {
      const status = getReviewStatus(questions[i], responses[i]);
      if (shouldIncludeByFilter(status, reviewFilter)) {
        indexes.push(i);
      }
    }
    return indexes;
  }, [phase, questions, responses, reviewFilter]);

  async function startPractice() {
    setIsLoading(true);
    setError("");
    setMinutesHint("");
    try {
      const safeMinutes = clampMinutes(minutesPerQuestion);
      if (safeMinutes !== minutesPerQuestion) {
        setMinutesPerQuestion(safeMinutes);
        setMinutesHint(uiText.practice.minutesRangeHint);
      }
      const res = await fetch(`/api/practice/questions?count=${questionCount}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || uiText.practice.errors.loadQuestionsFailed);
      }
      setQuestions(data.questions);
      setResponses(data.questions.map((q) => setupResponse(q)));
      setCurrentIndex(0);
      setTimeLeft(questionCount * safeMinutes * 60);
      setSessionStartedAt(Date.now());
      setSummarySaved(false);
      setPhase("active");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateCurrentResponse(next) {
    setResponses((prev) => prev.map((item, idx) => (idx === currentIndex ? { ...item, ...next } : item)));
  }

  function toggleSubGrade(subId, checked) {
    setResponses((prev) =>
      prev.map((item, idx) => {
        if (idx !== currentIndex) {
          return item;
        }
        return {
          ...item,
          subGrades: {
            ...(item.subGrades ?? {}),
            [subId]: checked
          }
        };
      })
    );
  }

  function skipCurrent() {
    updateCurrentResponse({ skipped: true });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function finalizeCurrent() {
    updateCurrentResponse({ skipped: false });
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function finalizeAndReview() {
    updateCurrentResponse({ skipped: false });
    setPhase("review");
  }

  function skipAndReview() {
    updateCurrentResponse({ skipped: true });
    setPhase("review");
  }

  function resetToSetup() {
    setPhase("setup");
    setQuestions([]);
    setResponses([]);
    setCurrentIndex(0);
    setTimeLeft(0);
    setError("");
    setMinutesHint("");
    setSessionStartedAt(null);
    setSummarySaved(false);
    if (typeof window !== "undefined") {
      clearPersistedPracticeTest(window.localStorage);
    }
  }

  return (
    <main>
      <PageHeader title={uiText.practice.title}>
        <p>
          <a href="/practice/tags">{uiText.practice.switchToTagPractice}</a>
        </p>
      </PageHeader>

      {phase === "setup" && (
        <section className="card practice-block">
          <h2>{uiText.practice.setupTitle}</h2>
          <div className="setup-controls">
            <label>
              {uiText.practice.questionCountLabel}
              <select value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))}>
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </label>

            <div className="timer-setting-container">
              <label className="timer-toggle">
                <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
                {uiText.practice.minutesPerQuestionLabel}
              </label>
              <label className="timer-label">
                <p className="minutes-toast">{uiText.practice.minutesText(minutesPerQuestion)}</p>
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={minutesPerQuestion}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    const safe = clampMinutes(raw);
                    setMinutesPerQuestion(safe);
                    if (!Number.isFinite(raw) || safe !== raw) {
                      setMinutesHint(uiText.practice.minutesInputHint);
                    } else {
                      setMinutesHint("");
                    }
                  }}
                  disabled={!timed}
                />
              </label>
            </div>
            {minutesHint && <p className="muted">{minutesHint}</p>}
          </div>
          <button disabled={isLoading} onClick={startPractice}>
            {isLoading ? uiText.practice.startLoading : uiText.practice.start}
          </button>
          {error && <p className="error">{error}</p>}
        </section>
      )}

      {phase === "active" && currentQuestion && (
        <>
          <section className="card practice-block">
            <div className="practice-topbar">
              <strong>
                {uiText.practice.questionProgressPrefix} {currentIndex + 1} {uiText.practice.questionProgressOutOf}{" "}
                {questions.length}
              </strong>
              {timed && <strong>{uiText.practice.timeLeftLabel} {formatSeconds(timeLeft)}</strong>}
            </div>
            <div className="prompt-row">
              <p>{currentQuestion.text}</p>
              <ClickableStorageImage
                imageStoragePath={currentQuestion.image_storage_path}
                imageRef={currentQuestion.image_ref}
                alt={uiText.practice.altQuestionImage(currentQuestion.id)}
                className="question-image inline-thumb"
              />
            </div>

            {currentQuestion.type === "mcq" && (
              <div className="choices-list">
                {currentQuestion.choices.map((choice) => (
                  <label key={choice.id} className="choice-item">
                    <input
                      type="radio"
                      name={`q-${currentQuestion.id}`}
                      checked={currentResponse?.choiceId === choice.id}
                      onChange={() => updateCurrentResponse({ choiceId: choice.id, skipped: false })}
                    />
                    <span className="choice-text">
                      {choice.label}. {choice.text}
                    </span>
                    <ClickableStorageImage
                      imageStoragePath={choice.image_storage_path}
                      imageRef={choice.image_ref}
                      alt={uiText.practice.altChoiceImage(choice.label)}
                      className="choice-image inline-thumb"
                    />
                  </label>
                ))}
              </div>
            )}

            {currentQuestion.type === "open_text" && (
              <div className="open-text-block">
                <textarea
                  rows={5}
                  value={currentResponse?.text ?? ""}
                  onChange={(e) => updateCurrentResponse({ text: e.target.value, skipped: false })}
                  placeholder={uiText.practice.openTextPlaceholder}
                />
              </div>
            )}

            <div className="practice-actions">
              {isLastQuestion ? (
                <>
                  <button type="button" onClick={skipAndReview}>
                    {uiText.practice.buttons.skipAndFinish}
                  </button>
                  <button type="button" onClick={finalizeAndReview} disabled={!canSubmitCurrent}>
                    {uiText.practice.buttons.finishAndReview}
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={skipCurrent}>
                    {uiText.practice.buttons.skip}
                  </button>
                  <button type="button" onClick={finalizeCurrent} disabled={!canSubmitCurrent}>
                    {uiText.practice.buttons.saveAndNext}
                  </button>
                </>
              )}
            </div>
          </section>

          <section className="card practice-block">
            <h3>{uiText.practice.navigationTitle}</h3>
            <div className="navigator-grid">
              {questions.map((q, idx) => {
                const status = getQuestionStatus(q, responses[idx], idx === currentIndex);
                return (
                  <button
                    key={q.id}
                    className={`navigator-dot status-${status}`}
                    onClick={() => setCurrentIndex(idx)}
                    aria-label={uiText.practice.ariaQuestion(idx + 1)}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </section>
        </>
      )}

      {phase === "review" && (
        <section className="card practice-block">
          <h2>{uiText.practice.reviewTitle}</h2>
          <p>
            {uiText.practice.finalScoreLabel} <strong>{overallScore.toFixed(1)}%</strong>
          </p>
          <ReviewSummary summary={reviewSummary} />
          <ReviewControls
            reviewFilter={reviewFilter}
            setReviewFilter={setReviewFilter}
            showExplanations={showExplanations}
            setShowExplanations={setShowExplanations}
          />
          <div className="review-list">
            {reviewIndexes.map((idx) => {
              const q = questions[idx];
              const response = responses[idx];
              const attempted = hasAttempt(q, response);
              const perQuestionScore = scoreQuestion(q, response);
              const reviewStatus = getReviewStatus(q, response);
              return (
                <article key={q.id} className="review-item">
                  <ReviewStatusBadge status={reviewStatus} />
                  <div className="prompt-row">
                    <h3>
                      {idx + 1}. {q.text}
                    </h3>
                    <ClickableStorageImage
                      imageStoragePath={q.image_storage_path}
                      imageRef={q.image_ref}
                      alt={uiText.practice.altQuestionImage(q.id)}
                      className="question-image inline-thumb"
                    />
                  </div>
                  <p>{uiText.practice.tagsLabel} {(q.tags ?? []).join(", ") || uiText.common.notAvailable}</p>
                  <p>{uiText.practice.questionScoreLabel} {perQuestionScore.toFixed(1)}%</p>
                  <button type="button" onClick={() => setCollectionTargetQuestionId(q.id)}>
                    {uiText.collections.addModal.trigger}
                  </button>

                  {q.type === "mcq" && (
                    <>
                      <p>{uiText.practice.yourAnswerMcqLabel} {response?.choiceId || uiText.practice.unanswered}</p>
                      {attempted && <p>{uiText.practice.correctAnswerLabel} {q.correct_choice_id}</p>}
                      <div className="review-choice-list">
                        {q.choices?.map((choice) => {
                          const isCorrect = choice.id === q.correct_choice_id;
                          const isSelected = choice.id === response?.choiceId;
                          return (
                            <div
                              key={`${q.id}-review-choice-${choice.id}`}
                              className={`review-choice-bar${isCorrect ? " is-correct" : ""}${
                                isSelected ? " is-selected" : ""
                              }`}
                            >
                              <span className="choice-text">
                                {choice.label}. {choice.text}
                              </span>
                              <ClickableStorageImage
                                imageStoragePath={choice.image_storage_path}
                                imageRef={choice.image_ref}
                                alt={uiText.practice.altChoiceImage(choice.label)}
                                className="choice-image inline-thumb"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {q.type === "open_text" && (
                    <>
                      <p>{uiText.practice.yourAnswerLabel} {response?.text?.trim() || uiText.practice.unanswered}</p>
                      <div className="subgrade-list">
                        <strong>{uiText.practice.subGradesLabel}</strong>
                        {(q.sub_questions ?? []).map((sub) => (
                          <label key={sub.id} className="practice-inline">
                            <input
                              type="checkbox"
                              checked={Boolean(response?.subGrades?.[sub.id])}
                              onChange={(e) => {
                                setCurrentIndex(idx);
                                toggleSubGrade(sub.id, e.target.checked);
                              }}
                            />
                            {sub.label}. {sub.text}
                          </label>
                        ))}
                      </div>
                    </>
                  )}

                  {showExplanations && attempted && q.model_answer && (
                    <div>
                      <strong>{uiText.practice.explanationLabel}</strong>
                      <p>{q.model_answer}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          <button type="button" onClick={resetToSetup}>
            {uiText.practice.buttons.newTest}
          </button>
        </section>
      )}
      <AddToCollectionModal
        isOpen={Boolean(collectionTargetQuestionId)}
        questionId={collectionTargetQuestionId}
        onClose={() => setCollectionTargetQuestionId("")}
      />
    </main>
  );
}
