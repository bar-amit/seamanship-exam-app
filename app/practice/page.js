"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getNextQuestionIndex,
  getQuestionStatus,
  hasAttempt,
  scoreQuestion,
  scoreSession,
  setSubGradeAtIndex,
  updateResponseAtIndex
} from "../../src/features/practice-test/session.js";
import {
  buildReviewSummary,
  getFilteredReviewIndexes,
  getReviewStatus,
} from "../../src/features/practice-test/review.js";
import {
  clearPersistedPracticeTest,
  loadPracticeTestSession,
  savePracticeTestSession
} from "../../src/features/practice-test/persistence.js";
import {
  buildPracticeTestSummary,
  pushTestSummary
} from "../../src/features/practice-test/analytics.js";
import {
  clampCurrentIndex,
  clampPracticeMinutes,
  buildPracticeStartState,
  buildPracticeResetState,
  formatPracticeSeconds,
  normalizePracticeQuestionCount
} from "../../src/features/practice-test/setup.js";
import { fetchPracticeQuestions } from "../../src/features/practice-test/questions.js";
import { getSubAnswerForQuestion } from "../../src/features/practice-test/open-text.js";
import ClickableStorageImage from "../../src/components/clickable-storage-image.js";
import QuestionImageList from "../../src/components/question-image-list.js";
import ReviewSummary from "../../src/components/practice/review-summary.js";
import ReviewControls from "../../src/components/practice/review-controls.js";
import ReviewStatusBadge from "../../src/components/practice/review-status-badge.js";
import AddToCollectionModal from "../../src/components/add-to-collection-modal.js";
import PageHeader from "../../src/components/page-header.js";
import { uiText } from "../../src/content/strings.js";

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
      setQuestionCount(normalizePracticeQuestionCount(restored.questionCount));
      setTimed(restored.timed);
      setMinutesPerQuestion(clampPracticeMinutes(restored.minutesPerQuestion));
      setQuestions(restored.questions);
      setResponses(restored.responses);
      setCurrentIndex(clampCurrentIndex(restored.currentIndex, restored.questions.length));
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
    return getFilteredReviewIndexes(questions, responses, reviewFilter);
  }, [phase, questions, responses, reviewFilter]);

  async function startPractice() {
    setIsLoading(true);
    setError("");
    setMinutesHint("");
    try {
      const safeMinutes = clampPracticeMinutes(minutesPerQuestion);
      if (safeMinutes !== minutesPerQuestion) {
        setMinutesPerQuestion(safeMinutes);
        setMinutesHint(uiText.practice.minutesRangeHint);
      }
      const loadedQuestions = await fetchPracticeQuestions({
        count: questionCount,
        fallbackError: uiText.practice.errors.loadQuestionsFailed
      });
      const startState = buildPracticeStartState({
        questionCount,
        minutesPerQuestion,
        questions: loadedQuestions
      });
      setQuestions(startState.questions);
      setResponses(startState.responses);
      setCurrentIndex(startState.currentIndex);
      setTimeLeft(startState.timeLeft);
      setSessionStartedAt(startState.sessionStartedAt);
      setSummarySaved(startState.summarySaved);
      setPhase(startState.phase);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function updateCurrentResponse(next) {
    setResponses((prev) => updateResponseAtIndex(prev, currentIndex, next));
  }

  function toggleSubGrade(subId, checked) {
    setResponses((prev) => setSubGradeAtIndex(prev, currentIndex, subId, checked));
  }

  function skipCurrent() {
    updateCurrentResponse({ skipped: true });
    setCurrentIndex((prev) => getNextQuestionIndex(prev, questions.length));
  }

  function finalizeCurrent() {
    updateCurrentResponse({ skipped: false });
    setCurrentIndex((prev) => getNextQuestionIndex(prev, questions.length));
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
    const resetState = buildPracticeResetState();
    setPhase(resetState.phase);
    setQuestions(resetState.questions);
    setResponses(resetState.responses);
    setCurrentIndex(resetState.currentIndex);
    setTimeLeft(resetState.timeLeft);
    setError(resetState.error);
    setMinutesHint(resetState.minutesHint);
    setSessionStartedAt(resetState.sessionStartedAt);
    setSummarySaved(resetState.summarySaved);
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
                    const safe = clampPracticeMinutes(raw);
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
              {timed && <strong>{uiText.practice.timeLeftLabel} {formatPracticeSeconds(timeLeft)}</strong>}
            </div>
            <div className="prompt-row">
              <p>{currentQuestion.text}</p>
              <QuestionImageList
                question={currentQuestion}
                altForImage={(imageRef, index) =>
                  `${uiText.practice.altQuestionImage(currentQuestion.id)} ${index + 1}`
                }
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
                    <QuestionImageList
                      question={q}
                      altForImage={(imageRef, imageIndex) =>
                        `${uiText.practice.altQuestionImage(q.id)} ${imageIndex + 1}`
                      }
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
                        {(q.sub_questions ?? []).map((sub, subIndex) => {
                          const subAnswer = getSubAnswerForQuestion(q, sub, subIndex);
                          return (
                            <label key={`${sub.id}-${subIndex}`} className="practice-inline">
                              <input
                                type="checkbox"
                                checked={Boolean(response?.subGrades?.[sub.id])}
                                onChange={(e) => {
                                  setCurrentIndex(idx);
                                  toggleSubGrade(sub.id, e.target.checked);
                                }}
                              />
                              <span>
                                {sub.label}. {sub.text}
                                {showExplanations && subAnswer?.text && (
                                  <small className="sub-answer-text">{subAnswer.text}</small>
                                )}
                              </span>
                            </label>
                          );
                        })}
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
